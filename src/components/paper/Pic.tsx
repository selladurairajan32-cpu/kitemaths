import Image from "next/image";

/**
 * 3D pictures (Microsoft Fluent Emoji 3D, MIT licence: public/3d/LICENSE-fluentui-emoji.txt).
 * Each name is a file in public/3d. They carry the colour and fun of the Crystal design;
 * everything else stays calm and white.
 */
export const PIC_NAMES = [
  "pizza", "fraction-bar", "paint", "scales", "puzzle", "ruler", "sweets", "magnifier",
  "mountain", "wave", "falls", "meadow", "shapes", "summit",
  "place-value", "rounding", "thermometer", "plus", "times", "divide", "decimal", "coin", "clock",
  "area", "angle", "compass", "chart", "ratio", "bulb", "exam", "target", "dice", "trophy", "recheck",
  "kite", "star", "flame", "book", "lab", "map", "lock", "party", "medal", "sun", "books", "rocket", "glowing-star",
] as const;

export type PicName = (typeof PIC_NAMES)[number];

const NAMES: ReadonlySet<string> = new Set(PIC_NAMES);

export function isPicName(name: string): name is PicName {
  return NAMES.has(name);
}

/** A 3D picture. Decorative by default; pass `title` when it carries meaning on its own. */
export function Pic({
  name,
  size = 48,
  title,
  muted = false,
  className = "",
  priority = false,
  fluid = false,
}: {
  name: PicName;
  size?: number;
  title?: string;
  muted?: boolean;
  className?: string;
  priority?: boolean;
  /** Sized by its container (className) instead of `size`. */
  fluid?: boolean;
}) {
  return (
    <Image
      src={`/3d/${name}.png`}
      width={size}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      draggable={false}
      unoptimized
      priority={priority}
      // A fixed size by default: in a flex row an image with auto height would stretch to the row.
      style={fluid ? undefined : { width: size, height: size }}
      className={`inline-block shrink-0 select-none ${muted ? "opacity-40 grayscale" : ""} ${className}`}
    />
  );
}
