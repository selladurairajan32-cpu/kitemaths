"use client";

import { OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import * as THREE from "three";
import type { StageProps } from "./RatioExplanation";
import type { RatioScene } from "./ratioStory";
import { RatioSceneSvg } from "./RatioSceneSvg";

/**
 * D-040: the WebGL stage for the ratio story. Every object keeps its identity between beats and glides to its new
 * place, so the 35 sweets really do sort into groups, pour into jars and give way to the bar. Colours come from the CSS
 * design tokens at runtime. The child can drag to turn the table. Where WebGL is missing or motion is reduced, the
 * 2.5D SVG picture is drawn instead. The caption beside the stage says everything shown, so the canvas is hidden from
 * screen readers.
 */

type Palette = Record<Colour, string> & { font: string };
type Fixture = { key: string; node: ReactNode };
const TOKENS: Record<Exclude<keyof Palette, "font">, string> = { brand: "--color-brand", brandStrong: "--color-brand-strong", num: "--color-num", numStrong: "--color-num-strong", sky: "--color-sky", skySoft: "--color-sky-soft", tile: "--color-tile-blue", sun: "--color-sun", sunStrong: "--color-sun-strong", surface: "--color-surface", sunk: "--color-sunk", line: "--color-line-strong", ink: "--color-ink", ok: "--color-ok" };

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const colours = Object.fromEntries(Object.entries(TOKENS).map(([k, v]) => [k, css.getPropertyValue(v).trim() || "gray"]));
  return { ...colours, font: getComputedStyle(document.body).fontFamily || "sans-serif" } as Palette;
}

/** What this browser can do, read once on the client (null while rendering on the server). */
let client: { gl: boolean; palette: Palette } | null = null;
const noSubscribe = () => () => {};
const clientInfo = () => (client ??= { gl: canUseWebGL(), palette: readPalette() });
const serverInfo = () => null;

function canUseWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

import { layout, UNIT, type Colour, type Item, type V3 } from "./stageLayout";

/** Glides an object to its target, asking for frames only while it is still moving. */
function Glide({ to, scale = 1, children }: { to: V3; scale?: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(...to), [to]);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => invalidate(), [to, scale, invalidate]);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 5);
    g.position.lerp(target, k);
    const s = g.scale.x + (scale - g.scale.x) * k;
    g.scale.setScalar(s);
    if (g.position.distanceToSquared(target) > 1e-5 || Math.abs(s - scale) > 1e-3) invalidate();
  });
  return (
    <group ref={ref} position={[to[0], to[1] + 3, to[2]]} scale={0.001}>
      {children}
    </group>
  );
}

function Thing({ item, palette }: { item: Item; palette: Palette }) {
  const color = palette[item.color];
  if (item.shape === "cube")
    return (
      <RoundedBox args={[UNIT, UNIT, UNIT]} radius={0.07} smoothness={2} castShadow>
        <meshStandardMaterial color={color} roughness={0.45} />
      </RoundedBox>
    );
  if (item.shape === "part")
    return (
      <group>
        <RoundedBox args={[1, 0.6, 0.6]} radius={0.08} smoothness={2} castShadow>
          <meshStandardMaterial color={color} roughness={0.4} />
        </RoundedBox>
        <Label3D text={item.label ?? ""} pos={[0, 0.75, 0]} palette={palette} />
      </group>
    );
  if (item.shape === "egg")
    return (
      <mesh castShadow scale={[0.28, 0.36, 0.28]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color={palette.surface} roughness={0.6} emissive={palette.sun} emissiveIntensity={0.08} />
      </mesh>
    );
  return (
    <mesh castShadow>
      <sphereGeometry args={[0.15, 14, 10]} />
      <meshStandardMaterial color={color} roughness={0.35} />
    </mesh>
  );
}

/**
 * A text label in the scene: a pill drawn on a 2D canvas and shown on a sprite that always faces the camera. It uses
 * the page's font and colours, and is freed when it goes.
 */
function Label3D({ text, pos, palette }: { text: string; pos: V3; palette: Palette }) {
  const { texture, aspect } = useMemo(() => {
    const scale = 4;
    const font = `800 ${22 * scale}px ${palette.font}`;
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(text).width) + 40 * scale;
    const h = 44 * scale;
    c.width = w;
    c.height = h;
    ctx.font = font;
    ctx.fillStyle = palette.surface;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = palette.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2 + 2 * scale);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return { texture: t, aspect: w / h };
  }, [text, palette]);
  useEffect(() => () => texture.dispose(), [texture]);
  // Bigger on small screens, where the whole stage is smaller.
  const narrow = useThree((s) => s.size.width < 520);
  const height = narrow ? 0.62 : 0.42;
  return (
    <sprite position={pos} scale={[height * aspect, height, 1]} renderOrder={10}>
      <spriteMaterial map={texture} depthTest={false} transparent toneMapped={false} />
    </sprite>
  );
}

function Jar({ x, palette }: { x: number; palette: Palette }) {
  return (
    <mesh position={[x, 1.1, 0]}>
      <cylinderGeometry args={[0.72, 0.64, 2.2, 40, 1, true]} />
      <meshStandardMaterial color={palette.sky} transparent opacity={0.28} side={THREE.DoubleSide} roughness={0.1} />
    </mesh>
  );
}

function Jug({ milk, palette }: { milk: number; palette: Palette }) {
  const h = Math.max(0.05, (milk / 900) * 2);
  return (
    <group position={[1.8, 0, 0]}>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.8, 0.7, 2.3, 32, 1, true]} />
        <meshStandardMaterial color={palette.sky} transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <Glide to={[0, h / 2 - 3 + 0.05, 0]} scale={1}>
        <mesh position={[0, 3, 0]} scale={[1, h, 1]}>
          <cylinderGeometry args={[0.66, 0.66, 1, 32]} />
          <meshStandardMaterial color={palette.surface} roughness={0.3} />
        </mesh>
      </Glide>
    </group>
  );
}

function Scene({ scene, palette }: { scene: RatioScene; palette: Palette }) {
  const { items, labels, jars, jug } = useMemo(() => layout(scene), [scene]);
  const fixtures: Fixture[] = [...jars.map((x) => ({ key: `jar${x}`, node: <Jar x={x} palette={palette} /> })), ...(jug !== undefined ? [{ key: "jug", node: <Jug milk={jug} palette={palette} /> }] : [])];
  return (
    <>
      <hemisphereLight args={[palette.surface, palette.skySoft, 1.1]} />
      <directionalLight position={[4, 9, 6]} intensity={1.9} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <directionalLight position={[-5, 4, -3]} intensity={0.45} />
      <mesh position={[0, -0.14, 0]} receiveShadow>
        <cylinderGeometry args={[5.4, 5.6, 0.28, 72]} />
        <meshStandardMaterial color={palette.skySoft} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[5.05, 5.25, 72]} />
        <meshStandardMaterial color={palette.sky} roughness={0.6} />
      </mesh>
      {items.map((it) => (
        <Glide key={it.key} to={it.pos} scale={it.scale ?? 1}>
          <Thing item={it} palette={palette} />
        </Glide>
      ))}
      {fixtures.map((f) => <group key={f.key}>{f.node}</group>)}
      {labels.map((l) => (
        <Label3D key={l.key} text={l.text} pos={l.pos} palette={palette} />
      ))}
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.55} maxPolarAngle={1.25} minAzimuthAngle={-0.9} maxAzimuthAngle={0.9} target={[0, 0.55, 0.4]} />
    </>
  );
}

export function RatioStage3D({ scene, label }: StageProps) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const ready = useSyncExternalStore(noSubscribe, clientInfo, serverInfo);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ready]);

  if (!ready || !ready.gl || reduce) return <RatioSceneSvg scene={scene} />;
  return (
    <div ref={box} className="relative aspect-[5/3] w-full cursor-grab touch-none active:cursor-grabbing" data-stage="webgl" aria-hidden title={label}>
      <Canvas flat shadows dpr={[1, 1.75]} frameloop={visible ? "demand" : "never"} camera={{ position: [0, 3.5, 7.1], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <Scene scene={scene} palette={ready.palette} />
      </Canvas>
      <p className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-surface/80 px-2 text-label font-semibold text-ink-2">Drag to turn the table</p>
    </div>
  );
}
