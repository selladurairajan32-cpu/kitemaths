// Allowed-looking dependency (same layer) that reaches browser access through a helper (DEF-031).
// Only the transitive check can see this: neither this file nor the import breaks a direct rule.
import { read } from "../support/uses-window";
export const value = () => read();
