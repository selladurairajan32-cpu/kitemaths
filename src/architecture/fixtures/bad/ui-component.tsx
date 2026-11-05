import { useState } from "react";
export function Counter() {
  const [n] = useState(0);
  return <p>{n}</p>;
}
