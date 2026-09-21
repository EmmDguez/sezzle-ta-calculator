// Mirrors JavaScript's Number.MAX_SAFE_INTEGER, the overflow ceiling shared
// with the backend per CONTRACT.md.
export const MAX_SAFE_INTEGER_VALUE = Number.MAX_SAFE_INTEGER;

export interface DigitInputResult {
  value: string;
  overflowed: boolean;
}

/** Strips leading zeros from a digit string, e.g. "007" -> "7", "0.5" untouched. */
export function normalizeLeadingZeros(value: string): string {
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const stripped = unsigned.replace(/^0+(?=\d)/, "");
  return negative ? `-${stripped}` : stripped;
}

function exceedsMaxSafeInteger(candidate: string): boolean {
  if (candidate === "" || candidate === "-" || candidate.endsWith(".")) {
    return false;
  }
  const numeric = Number(candidate);
  return !Number.isNaN(numeric) && Math.abs(numeric) > MAX_SAFE_INTEGER_VALUE;
}

/**
 * Appends a single digit or period to the current display string, enforcing
 * the display's valid format (optional leading "-", digits, at most one
 * ".") and the MAX_SAFE_INTEGER ceiling. Returns the current value
 * unchanged with `overflowed: true` when the keystroke would exceed it.
 */
export function appendDigit(current: string, char: string): DigitInputResult {
  if (char === "-") {
    // Only meaningful when nothing's been typed yet for this operand —
    // calculator-shell only ever calls this with "-" in that case,
    // dispatching to the subtract action otherwise.
    return current === ""
      ? { value: "-", overflowed: false }
      : { value: current, overflowed: false };
  }

  if (char === ".") {
    if (current.includes(".")) {
      return { value: current, overflowed: false };
    }
    const base = current === "" || current === "-" ? `${current}0` : current;
    return { value: `${base}.`, overflowed: false };
  }

  const candidate = normalizeLeadingZeros(current + char);
  if (exceedsMaxSafeInteger(candidate)) {
    return { value: current, overflowed: true };
  }
  return { value: candidate, overflowed: false };
}

/** True for a display value with no usable number yet ("" or a lone "-"). */
export function isBlankOperand(value: string): boolean {
  return value === "" || value === "-";
}
