import type { ActionKind, Operation } from "@/types/calculator";

interface OperationButtonConfig {
  label: string;
  ariaLabel: string;
}

// Keyed by operation name (not array position) so the keypad can look up a
// button's label/aria-label by the operation it needs, immune to reordering.
export const OPERATION_BUTTON: Record<Operation, OperationButtonConfig> = {
  sqrt: { label: "√", ariaLabel: "Square root" },
  divide: { label: "÷", ariaLabel: "Divide" },
  multiply: { label: "×", ariaLabel: "Multiply" },
  subtract: { label: "−", ariaLabel: "Subtract" },
  add: { label: "+", ariaLabel: "Add" },
  power: { label: "x^y", ariaLabel: "Power" },
};

export const KEY_TO_ACTION: Record<string, ActionKind> = {
  Escape: "all-clear",
  Backspace: "clear",
  Delete: "clear",
  Enter: "equals",
  "=": "equals",
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  "/": "divide",
  "^": "power",
  r: "sqrt",
  R: "sqrt",
};
