export const read = (name: string) => (globalThis as unknown as Record<string, unknown>)[name];
export const viaWindow = (name: string) => (window as unknown as Record<string, unknown>)[name];
