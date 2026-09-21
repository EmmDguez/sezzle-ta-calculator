import type { ActionKind, Operation } from "@/types/calculator";
import { InputButton } from "./input-button";
import { ActionButton } from "./action-button";
import { OPERATION_BUTTON } from "./button-config";

interface KeypadProps {
  activeOperation: Operation | null;
  onDigit: (digit: string) => void;
  onAction: (kind: ActionKind) => void;
}

interface OperationSlotProps {
  operation: Operation;
  activeOperation: Operation | null;
  onAction: (kind: ActionKind) => void;
  className?: string;
}

function OperationSlot({
  operation,
  activeOperation,
  onAction,
  className,
}: OperationSlotProps) {
  const { label, ariaLabel } = OPERATION_BUTTON[operation];
  return (
    <ActionButton
      kind={operation}
      label={label}
      ariaLabel={ariaLabel}
      active={activeOperation === operation}
      onPress={onAction}
      className={className}
    />
  );
}

/** 4-column grid: clear row, then operations down the right column, digits filling the rest. */
export function Keypad({ activeOperation, onDigit, onAction }: KeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      <ActionButton
        kind="all-clear"
        label="AC"
        ariaLabel="All clear"
        onPress={onAction}
        className="text-base"
      />
      <ActionButton
        kind="clear"
        label="C"
        ariaLabel="Clear"
        onPress={onAction}
        className="text-base"
      />
      <OperationSlot
        operation="sqrt"
        activeOperation={activeOperation}
        onAction={onAction}
      />
      <OperationSlot
        operation="divide"
        activeOperation={activeOperation}
        onAction={onAction}
      />

      <InputButton digit="7" onPress={onDigit} />
      <InputButton digit="8" onPress={onDigit} />
      <InputButton digit="9" onPress={onDigit} />
      <OperationSlot
        operation="multiply"
        activeOperation={activeOperation}
        onAction={onAction}
      />

      <InputButton digit="4" onPress={onDigit} />
      <InputButton digit="5" onPress={onDigit} />
      <InputButton digit="6" onPress={onDigit} />
      <OperationSlot
        operation="subtract"
        activeOperation={activeOperation}
        onAction={onAction}
      />

      <InputButton digit="1" onPress={onDigit} />
      <InputButton digit="2" onPress={onDigit} />
      <InputButton digit="3" onPress={onDigit} />
      <OperationSlot
        operation="add"
        activeOperation={activeOperation}
        onAction={onAction}
      />

      <OperationSlot
        operation="power"
        activeOperation={activeOperation}
        onAction={onAction}
        className="text-base"
      />
      <InputButton digit="0" onPress={onDigit} />
      <InputButton digit="." onPress={onDigit} />
      <ActionButton
        kind="equals"
        label="="
        ariaLabel="Equals"
        onPress={onAction}
      />
    </div>
  );
}
