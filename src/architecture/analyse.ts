import { dirname, join, relative, resolve } from "node:path";
import ts from "typescript";

/**
 * ARCH-001 guard tooling (test-only; not part of the app).
 *
 * Parses source files with the TypeScript compiler, so comments and strings are never mistaken
 * for code, and:
 *  - lists every module dependency: static imports (including side-effect and type-only),
 *    `export … from`, `import x = require()`, `import()` (also in type positions) and `require()`,
 *    resolved with the project's own module resolution (relative paths and the `@/` alias);
 *  - reports dependencies that cannot be resolved, and `import()` / `require()` with a non-literal
 *    argument, which a static check cannot follow;
 *  - reports uses of an explicit list of prohibited global capabilities (browser storage, DOM,
 *    network). The type checker resolves each name in its lexical scope, so a local variable that
 *    shadows `document` is not a global use, while a real global use elsewhere in the same file is.
 *    A name counts as global when its declaration is not in the project's own source: DOM lib
 *    typings, Node typings (`fetch`) or any other typings. Standard APIs such as `Math` are never
 *    on the list;
 *  - reports the global object itself escaping (DEF-030): `globalThis` or `self` used as anything other than the
 *    object of a property or element access. Destructuring (`const { localStorage } = globalThis`), aliases
 *    (`const g = globalThis`), arguments (`Reflect.get(globalThis, …)`) and spreads hide which capability is used,
 *    so they are rejected. A local variable or parameter that shadows the name is not the global object;
 *  - marks each dependency as type-only when every imported name is type-only (`import type`, or only inline
 *    `type` specifiers), because a type-only edge has no runtime effect;
 *  - `transitiveViolations` walks runtime (non-type-only) edges from a file and reports any file it reaches that
 *    imports UI at runtime or uses a prohibited global, with the chain (DEF-031).
 */

/** Global capabilities pure layers may not use (ARCH-001 §1: no browser APIs, no I/O). */
export const PROHIBITED_GLOBALS = [
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "navigator",
  "indexedDB",
  "fetch",
  "XMLHttpRequest",
  "matchMedia",
  "requestAnimationFrame",
  "location",
  "history",
] as const;
const PROHIBITED = new Set<string>(PROHIBITED_GLOBALS);
/** Objects through which a global can also be reached: `globalThis.localStorage`, `window["fetch"]`. */
const GLOBAL_OBJECTS = new Set(["globalThis", "window", "self"]);

export interface Dependency {
  file: string;
  line: number;
  specifier: string;
  /** Absolute path of the resolved source file, when it is part of the project or a package. */
  resolved: string | null;
  /** Package name for a bare specifier (`react`, `next/navigation` → `next`). */
  packageName: string | null;
  typeOnly: boolean;
  via: "import" | "export" | "import-equals" | "dynamic-import" | "require" | "import-type";
}

export interface Problem {
  file: string;
  line: number;
  kind: "unresolved" | "non-literal" | "prohibited-global" | "global-object-escape";
  detail: string;
}

export interface Analysis {
  dependencies: Dependency[];
  problems: Problem[];
}

const ROOT = process.cwd();

/** Strips parentheses, casts and non-null assertions: `(globalThis as X)` → `globalThis`. */
function unwrap(e: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isTypeAssertionExpression(e) || ts.isNonNullExpression(e) || ts.isSatisfiesExpression(e)) e = e.expression;
  return e;
}

/** The compiler options from the project's tsconfig.json (paths, module resolution, libs, jsx). */
export function projectOptions(overrides: ts.CompilerOptions = {}): ts.CompilerOptions {
  const configPath = join(ROOT, "tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(configPath));
  return { ...parsed.options, noEmit: true, incremental: false, ...overrides };
}

function packageOf(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function isProjectSource(fileName: string): boolean {
  const abs = resolve(fileName);
  return abs.startsWith(ROOT) && !abs.includes(`${"/"}node_modules${"/"}`);
}

/** Analyse the given files. Pass `options` to analyse fixtures under different libs/types. */
export function analyse(files: string[], options: ts.CompilerOptions = projectOptions()): Analysis {
  const roots = files.map((f) => resolve(ROOT, f));
  const program = ts.createProgram({ rootNames: roots, options });
  const checker = program.getTypeChecker();
  const dependencies: Dependency[] = [];
  const problems: Problem[] = [];

  for (const root of roots) {
    const sf = program.getSourceFile(root);
    if (!sf) throw new Error(`Cannot read ${root}`);
    const file = relative(ROOT, root).split("\\").join("/");
    const lineOf = (node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

    const addDependency = (node: ts.Node, arg: ts.Expression | undefined, via: Dependency["via"], typeOnly: boolean) => {
      if (!arg || !(ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))) {
        problems.push({ file, line: lineOf(node), kind: "non-literal", detail: `${via} with a non-literal module name cannot be checked` });
        return;
      }
      const specifier = arg.text;
      const result = ts.resolveModuleName(specifier, root, options, ts.sys).resolvedModule;
      const local = specifier.startsWith(".") || specifier.startsWith("@/");
      if (!result && local) problems.push({ file, line: lineOf(node), kind: "unresolved", detail: `cannot resolve "${specifier}"` });
      dependencies.push({
        file,
        line: lineOf(node),
        specifier,
        resolved: result ? resolve(result.resolvedFileName) : null,
        packageName: local ? null : packageOf(specifier),
        typeOnly,
        via,
      });
    };

    const isProhibitedGlobal = (id: ts.Identifier): boolean => {
      if (!PROHIBITED.has(id.text)) return false;
      // `{ document }` is shorthand for `{ document: document }`: the value is a reference.
      const symbol = ts.isShorthandPropertyAssignment(id.parent) ? checker.getShorthandAssignmentValueSymbol(id.parent) : checker.getSymbolAtLocation(id);
      // No declaration at all: an undeclared global, which is just as unsafe in a pure layer.
      if (!symbol?.declarations?.length) return true;
      return symbol.declarations.every((d) => !isProjectSource(d.getSourceFile().fileName));
    };

    /** True when `id` is a name rather than a reference: a property, member, label or declaration name. */
    const isNameOnly = (id: ts.Identifier): boolean => {
      const p = id.parent;
      return (
        (ts.isPropertyAccessExpression(p) && p.name === id) ||
        (ts.isQualifiedName(p) && p.right === id) ||
        ((ts.isPropertyAssignment(p) || ts.isPropertyDeclaration(p) || ts.isPropertySignature(p) || ts.isMethodDeclaration(p) || ts.isMethodSignature(p) || ts.isGetAccessor(p) || ts.isSetAccessor(p) || ts.isEnumMember(p)) && p.name === id) ||
        (ts.isBindingElement(p) && p.propertyName === id) ||
        ((ts.isImportSpecifier(p) || ts.isExportSpecifier(p)) && p.propertyName === id) ||
        ts.isLabeledStatement(p) ||
        ts.isBreakOrContinueStatement(p)
      );
    };

    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node)) {
        const clause = node.importClause;
        const named = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : undefined;
        const typeOnly = !!clause && (clause.isTypeOnly || (!clause.name && !!named && named.length > 0 && named.every((e) => e.isTypeOnly)));
        addDependency(node, node.moduleSpecifier, "import", typeOnly);
      } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
        const named = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : undefined;
        addDependency(node, node.moduleSpecifier, "export", node.isTypeOnly || (!!named && named.length > 0 && named.every((e) => e.isTypeOnly)));
      } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
        addDependency(node, node.moduleReference.expression, "import-equals", node.isTypeOnly);
      } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
        addDependency(node, node.argument.literal as ts.Expression, "import-type", true);
      } else if (ts.isCallExpression(node)) {
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword) addDependency(node, node.arguments[0], "dynamic-import", false);
        else if (ts.isIdentifier(node.expression) && node.expression.text === "require") addDependency(node, node.arguments[0], "require", false);
      }

      // globalThis.localStorage, window["fetch"], (globalThis as Record<string, unknown>)[name]
      const object = (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) ? unwrap(node.expression) : undefined;
      if (object && ts.isIdentifier(object) && GLOBAL_OBJECTS.has(object.text) && (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))) {
        const objectSymbol = checker.getSymbolAtLocation(object);
        const objectIsGlobal = !objectSymbol?.declarations?.length || objectSymbol.declarations.every((d) => !isProjectSource(d.getSourceFile().fileName));
        if (objectIsGlobal) {
          if (ts.isPropertyAccessExpression(node)) {
            if (PROHIBITED.has(node.name.text)) problems.push({ file, line: lineOf(node), kind: "prohibited-global", detail: `${object.text}.${node.name.text}` });
          } else {
            const arg = node.argumentExpression;
            if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
              if (PROHIBITED.has(arg.text)) problems.push({ file, line: lineOf(node), kind: "prohibited-global", detail: `${object.text}["${arg.text}"]` });
            } else {
              problems.push({ file, line: lineOf(node), kind: "prohibited-global", detail: `${object.text}[…] with a computed name cannot be checked` });
            }
          }
        }
      }

      // The global object escaping: globalThis / self as anything but the object of a member access (DEF-030).
      if (ts.isIdentifier(node) && (node.text === "globalThis" || node.text === "self") && !isNameOnly(node) && !ts.findAncestor(node, ts.isTypeNode)) {
        const symbol = checker.getSymbolAtLocation(node);
        const isGlobalObject = !symbol?.declarations?.length || symbol.declarations.every((d) => !isProjectSource(d.getSourceFile().fileName));
        if (isGlobalObject) {
          let top: ts.Node = node;
          while (top.parent && (ts.isParenthesizedExpression(top.parent) || ts.isAsExpression(top.parent) || ts.isTypeAssertionExpression(top.parent) || ts.isNonNullExpression(top.parent) || ts.isSatisfiesExpression(top.parent)) && top.parent.expression === top) top = top.parent;
          const parent = top.parent;
          const isMemberObject = parent && (ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent)) && parent.expression === top;
          if (!isMemberObject) {
            const names: string[] = [];
            const pattern = ts.isVariableDeclaration(parent) && parent.initializer === top ? parent.name : ts.isParameter(parent) && parent.initializer === top ? parent.name : undefined;
            if (pattern && ts.isObjectBindingPattern(pattern)) {
              for (const el of pattern.elements) {
                const key = el.propertyName ?? el.name;
                names.push(ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : "[computed]");
              }
            }
            problems.push({
              file,
              line: lineOf(node),
              kind: "global-object-escape",
              detail: `${node.text} escapes: destructured, aliased or passed on, so which capability is used can't be checked${names.length ? ` (captures ${names.join(", ")})` : ""}`,
            });
          }
        }
      }

      if (ts.isIdentifier(node) && !isNameOnly(node) && isProhibitedGlobal(node)) {
        problems.push({ file, line: lineOf(node), kind: "prohibited-global", detail: node.text });
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return { dependencies, problems };
}

/**
 * Walks runtime (non-type-only) project dependencies from each start file and reports every file it reaches that
 * imports UI at runtime, uses a prohibited global, or has an unresolved or non-literal import. The start file itself is
 * not reported (its own violations are the direct rules' job), so this finds problems hidden behind an intermediate
 * module (DEF-031). `analysis` must include every file that can be reached.
 */
export function transitiveViolations(analysis: Analysis, starts: string[], isUiPackage: (name: string) => boolean): string[] {
  const norm = (abs: string) => relative(ROOT, abs).split("\\").join("/");
  const edges = new Map<string, Dependency[]>();
  for (const d of analysis.dependencies) edges.set(d.file, [...(edges.get(d.file) ?? []), d]);
  const problems = new Map<string, Problem[]>();
  for (const p of analysis.problems) problems.set(p.file, [...(problems.get(p.file) ?? []), p]);
  const out: string[] = [];
  for (const start of starts) {
    const seen = new Set<string>([start]);
    /** `path` is the chain of files from `start` to `file`, inclusive. */
    const visit = (file: string, path: string[]) => {
      for (const d of edges.get(file) ?? []) {
        if (d.typeOnly) continue;
        if (file !== start && d.packageName !== null && isUiPackage(d.packageName)) out.push(`${path.join(" → ")} → ${d.specifier}: reaches UI at runtime`);
        const target = d.resolved && !d.resolved.includes("/node_modules/") ? norm(d.resolved) : null;
        if (target && !seen.has(target)) {
          seen.add(target);
          for (const p of problems.get(target) ?? []) out.push(`${[...path, target].join(" → ")}: ${p.kind} at line ${p.line}: ${p.detail}`);
          visit(target, [...path, target]);
        }
      }
    };
    visit(start, [start]);
  }
  return out;
}
