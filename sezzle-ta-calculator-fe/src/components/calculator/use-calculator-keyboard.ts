import { useEffect } from "react";
import type { ActionKind } from "@/types/calculator";
import { KEY_TO_ACTION } from "./button-config";

interface UseCalculatorKeyboardArgs {
  onDigit: (char: string) => void;
  onAction: (kind: ActionKind) => void;
}

/** Mirrors every calculator button on the keyboard, funneling into the same handlers as clicks. */
export function useCalculatorKeyboard({
  onDigit,
  onAction,
}: UseCalculatorKeyboardArgs): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (/^[0-9]$/.test(event.key) || event.key === ".") {
        onDigit(event.key);
        return;
      }
      const action = KEY_TO_ACTION[event.key];
      if (action) {
        onAction(action);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDigit, onAction]);
}
