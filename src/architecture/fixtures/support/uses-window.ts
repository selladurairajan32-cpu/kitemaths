// Support file for indirect-via-helper.ts. It is not scanned directly: it is only reached through an import.
export const read = () => window.localStorage.getItem("k");
