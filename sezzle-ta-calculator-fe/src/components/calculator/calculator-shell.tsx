import { useCallback, useRef, useState } from "react";
import type { ActionKind, Operation } from "@/types/calculator";
import { appendDigit } from "@/lib/number-input";
import { DisplayExpression } from "./display-expression";
import { DisplayMain } from "./display-main";
import { Keypad } from "./keypad";
import { useCalculatorKeyboard } from "./use-calculator-keyboard";

const ERROR_DISPLAY_MS = 900;

function isOperation(kind: ActionKind): kind is Operation {
  return kind !== "all-clear" && kind !== "clear" && kind !== "equals";
}

/**
 * Holds the calculator's body and its (deliberately minimal) local state.
 * Story 1.2 covers digit entry, AC/C, and clickable-but-inert operation/=
 * buttons only — the left/operation/right/isTemporal state machine and the
 * POST /api/v1/calculate call are Story 1.4's responsibility.
 */
export function CalculatorShell() {
  const [displayValue, setDisplayValue] = useState("");
  // Always blank in this story; display-expression is fully functional and
  // ready for Story 1.4 to populate once real operations are wired in.
  const [expression] = useState("");
  const [isError, setIsError] = useState(false);
  const [activeOperation, setActiveOperation] = useState<Operation | null>(
    null,
  );
  const errorTimeoutRef = useRef<number | null>(null);

  const clearErrorTimeout = useCallback(() => {
    if (errorTimeoutRef.current !== null) {
      window.clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const handleDigit = useCallback(
    (char: string) => {
      clearErrorTimeout();
      const result = appendDigit(displayValue, char);
      if (result.overflowed) {
        setIsError(true);
        errorTimeoutRef.current = window.setTimeout(() => {
          setIsError(false);
        }, ERROR_DISPLAY_MS);
        return;
      }
      setIsError(false);
      setDisplayValue(result.value);
    },
    [displayValue, clearErrorTimeout],
  );

  const handleAction = useCallback(
    (kind: ActionKind) => {
      if (kind === "all-clear") {
        clearErrorTimeout();
        setDisplayValue("");
        setIsError(false);
        setActiveOperation(null);
        return;
      }
      if (kind === "clear") {
        clearErrorTimeout();
        setDisplayValue("");
        setIsError(false);
        return;
      }
      if (kind === "equals") {
        // Inert in this story: computing/sending a result is Story 1.4.
        return;
      }
      if (isOperation(kind)) {
        setActiveOperation((current) => (current === kind ? null : kind));
      }
    },
    [clearErrorTimeout],
  );

  useCalculatorKeyboard({ onDigit: handleDigit, onAction: handleAction });

  return (
    <div className="w-full max-w-[360px] rounded-3xl border border-border bg-card p-4 shadow-xl sm:max-w-[400px] sm:p-6">
      <DisplayExpression value={expression} />
      <DisplayMain value={displayValue} isError={isError} />
      <Keypad
        activeOperation={activeOperation}
        onDigit={handleDigit}
        onAction={handleAction}
      />
    </div>
  );
}
