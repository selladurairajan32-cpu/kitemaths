/** Whole numbers in words, the way UK children are taught: 3,042 → "three thousand and forty-two". */

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function underHundred(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
}

/** 0–999, with "and" before the tens and ones when there are hundreds. */
function underThousand(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (!h) return underHundred(rest);
  return `${ONES[h]} hundred${rest ? ` and ${underHundred(rest)}` : ""}`;
}

export function numberWords(n: number): string {
  if (n < 0) return `minus ${numberWords(-n)}`;
  if (n === 0) return "zero";
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (millions) parts.push(`${underThousand(millions)} million`);
  if (thousands) parts.push(`${underThousand(thousands)} thousand`);
  if (rest) parts.push(rest < 100 && parts.length ? `and ${underHundred(rest)}` : underThousand(rest));
  return parts.join(" ");
}
