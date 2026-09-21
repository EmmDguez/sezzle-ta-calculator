import { useCallback, useRef, useState } from "react";
import type { ActionKind, Operation } from "@/types/calculator";
import { appendDigit, isBlankOperand } from "@/lib/number-input";
import { calculate } from "@/lib/calculator-api";
import { OPERATION_BUTTON } from "./button-config";
import { DisplayExpression } from "./display-expression";
import { DisplayMain, type DisplayStatus } from "./display-main";
import { Keypad } from "./keypad";
import { useCalculatorKeyboard } from "./use-calculator-keyboard";

const ERROR_DISPLAY_MS = 900;

function isOperation(kind: ActionKind): kind is Operation {
  return kind !== "all-clear" && kind !== "clear" && kind !== "equals";
}

function formatExpression(
  left: number,
  operation: Operation,
  right: number,
): string {
  return `${left} ${OPERATION_BUTTON[operation].label} ${right}`;
}

/**
 * Holds the calculator's body and its state machine: left/operation are
 * committed once an operation button locks them in, the in-progress
 * operand always lives in displayValue (matching CONTRACT.md's request
 * shape), and isTemporal marks when displayValue is showing a BE result
 * rather than user-typed input. Calls POST /api/v1/calculate directly
 * (Story 1.3.1 added the BE's CORS support for this).
 */
export function CalculatorShell() {
  const [displayValue, setDisplayValue] = useState("");
  const [expression, setExpression] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [isTemporal, setIsTemporal] = useState(false);
  const [status, setStatus] = useState<DisplayStatus>("ok");
  const [isLoading, setIsLoading] = useState(false);

  const errorTimeoutRef = useRef<number | null>(null);
  // Bumped on every new request and on all-clear, so a response that
  // arrives after the user has moved on (or reset) is simply discarded.
  const requestSeqRef = useRef(0);

  const clearErrorTimeout = useCallback(() => {
    if (errorTimeoutRef.current !== null) {
      window.clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const runCalculation = useCallback(
    (
      op: Operation,
      leftOperand: number,
      rightOperand: number | undefined,
      expressionText: string,
      onSuccess: (result: number) => void,
    ) => {
      const seq = ++requestSeqRef.current;
      setIsLoading(true);
      void calculate(op, leftOperand, rightOperand).then((outcome) => {
        if (requestSeqRef.current !== seq) {
          return;
        }
        setIsLoading(false);
        // Cancel any pending overflow auto-revert — otherwise it could
        // fire later and silently clear the status this response sets.
        clearErrorTimeout();
        if (outcome.ok) {
          setExpression(expressionText);
          setIsTemporal(true);
          setDisplayValue(String(outcome.result));
          setStatus("ok");
          onSuccess(outcome.result);
        } else if (outcome.kind === "rejected") {
          // A rejected calculation resets everything, as if AC had been
          // pressed — there's nothing salvageable to "correct and retry."
          setDisplayValue("");
          setExpression("");
          setLeft(null);
          setOperation(null);
          setIsTemporal(false);
          setStatus("error");
        } else {
          // Unreachable BE, not a rejected calculation — preserve
          // left/operation/displayValue so the user can just retry.
          setStatus("unavailable");
        }
      });
    },
    [clearErrorTimeout],
  );

  const handleDigit = useCallback(
    (char: string) => {
      if (isLoading) {
        return;
      }
      clearErrorTimeout();
      if (isTemporal) {
        // A result is on screen: typing starts a brand new number rather
        // than appending to the result, per epics.md's isTemporal-toggle
        // rule (this also clears the now-stale expression trail).
        setIsTemporal(false);
        setExpression("");
        setStatus("ok");
        setDisplayValue(appendDigit("", char).value);
        return;
      }
      const result = appendDigit(displayValue, char);
      if (result.overflowed) {
        // Resets everything immediately, like AC — the auto-revert timer
        // below only controls how long "ERR" stays on screen before the
        // now-cleared state (an empty display) is revealed.
        setDisplayValue("");
        setExpression("");
        setLeft(null);
        setOperation(null);
        setIsTemporal(false);
        setStatus("error");
        errorTimeoutRef.current = window.setTimeout(() => {
          setStatus("ok");
        }, ERROR_DISPLAY_MS);
        return;
      }
      setStatus("ok");
      setDisplayValue(result.value);
    },
    [displayValue, isTemporal, isLoading, clearErrorTimeout],
  );

  const handleAction = useCallback(
    (kind: ActionKind) => {
      if (isLoading && kind !== "all-clear") {
        return;
      }

      if (kind === "all-clear") {
        clearErrorTimeout();
        requestSeqRef.current += 1;
        setIsLoading(false);
        setDisplayValue("");
        setExpression("");
        setStatus("ok");
        setLeft(null);
        setOperation(null);
        setIsTemporal(false);
        return;
      }

      if (kind === "clear") {
        clearErrorTimeout();
        setDisplayValue("");
        setStatus("ok");
        if (isTemporal) {
          // The blanked value was a result being shown, not a partial
          // entry — clear its now-stale expression trail too.
          setIsTemporal(false);
          setExpression("");
        }
        return;
      }

      if (kind === "equals") {
        if (operation === null || isBlankOperand(displayValue) || left === null) {
          return;
        }
        const rightOperand = Number(displayValue);
        runCalculation(
          operation,
          left,
          rightOperand,
          formatExpression(left, operation, rightOperand),
          (result) => {
            setLeft(result);
            setOperation(null);
          },
        );
        return;
      }

      if (kind === "sqrt") {
        if (isBlankOperand(displayValue)) {
          return;
        }
        const operand = Number(displayValue);
        // sqrt always short-circuits: it abandons any pending binary
        // operation rather than trying to resume it afterward.
        setLeft(null);
        setOperation(null);
        runCalculation(
          "sqrt",
          operand,
          undefined,
          `${OPERATION_BUTTON.sqrt.label}(${displayValue})`,
          () => {},
        );
        return;
      }

      if (kind === "subtract" && displayValue === "") {
        // Nothing typed yet for this operand: "-" starts a negative
        // number instead of acting as the subtract operation, regardless
        // of whether an operation is already pending.
        handleDigit("-");
        return;
      }

      if (isOperation(kind)) {
        if (operation === null) {
          if (isBlankOperand(displayValue)) {
            return;
          }
          setLeft(Number(displayValue));
          setOperation(kind);
          setDisplayValue("");
          setIsTemporal(false);
          setExpression("");
          return;
        }

        if (isBlankOperand(displayValue) || isTemporal || status === "unavailable") {
          // Swap the pending operation without computing — this also
          // covers correcting the operation after a network failure
          // (status === "unavailable"), revealing the preserved
          // right-hand entry again instead of resubmitting the stale one.
          setStatus("ok");
          setOperation(kind);
          return;
        }

        if (left === null) {
          return;
        }
        const rightOperand = Number(displayValue);
        runCalculation(
          operation,
          left,
          rightOperand,
          formatExpression(left, operation, rightOperand),
          (result) => {
            setLeft(result);
            setOperation(kind);
          },
        );
      }
    },
    [
      operation,
      displayValue,
      isTemporal,
      left,
      status,
      isLoading,
      clearErrorTimeout,
      runCalculation,
      handleDigit,
    ],
  );

  useCalculatorKeyboard({ onDigit: handleDigit, onAction: handleAction });

  return (
    <div className="w-full max-w-[360px] rounded-3xl border border-border bg-card p-4 shadow-xl sm:max-w-[400px] sm:p-6">
      <DisplayExpression value={expression} />
      <DisplayMain value={displayValue} status={status} />
      <Keypad
        operation={operation}
        disabled={isLoading}
        onDigit={handleDigit}
        onAction={handleAction}
      />
    </div>
  );
}
