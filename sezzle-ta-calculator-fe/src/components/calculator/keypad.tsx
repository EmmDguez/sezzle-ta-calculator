import type { ActionKind, Operation } from "@/types/calculator";
import { InputButton } from "./input-button";
import { ActionButton } from "./action-button";
import { OPERATION_BUTTON } from "./button-config";

interface KeypadProps {
  operation: Operation | null;
  disabled?: boolean;
  onDigit: (digit: string) => void;
  onAction: (kind: ActionKind) => void;
}

interface OperationSlotProps {
  operation: Operation;
  activeOperation: Operation | null;
  disabled?: boolean;
  onAction: (kind: ActionKind) => void;
  className?: string;
}

function OperationSlot({
  operation,
  activeOperation,
  disabled,
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
      disabled={disabled}
      onPress={onAction}
      className={className}
    />
  );
}

/** 4-column grid: clear row, then operations down the right column, digits filling the rest. */
export function Keypad({
  operation,
  disabled = false,
  onDigit,
  onAction,
}: KeypadProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      <ActionButton
        kind="all-clear"
        label="AC"
        ariaLabel="All clear"
        disabled={disabled}
        onPress={onAction}
        className="text-base"
      />
      <ActionButton
        kind="clear"
        label="C"
        ariaLabel="Clear"
        disabled={disabled}
        onPress={onAction}
        className="text-base"
      />
      <OperationSlot
        operation="sqrt"
        activeOperation={operation}
        disabled={disabled}
        onAction={onAction}
      />
      <OperationSlot
        operation="divide"
        activeOperation={operation}
        disabled={disabled}
        onAction={onAction}
      />

      <InputButton digit="7" onPress={onDigit} disabled={disabled} />
      <InputButton digit="8" onPress={onDigit} disabled={disabled} />
      <InputButton digit="9" onPress={onDigit} disabled={disabled} />
      <OperationSlot
        operation="multiply"
        activeOperation={operation}
        disabled={disabled}
        onAction={onAction}
      />

      <InputButton digit="4" onPress={onDigit} disabled={disabled} />
      <InputButton digit="5" onPress={onDigit} disabled={disabled} />
      <InputButton digit="6" onPress={onDigit} disabled={disabled} />
      <OperationSlot
        operation="subtract"
        activeOperation={operation}
        disabled={disabled}
        onAction={onAction}
      />

      <InputButton digit="1" onPress={onDigit} disabled={disabled} />
      <InputButton digit="2" onPress={onDigit} disabled={disabled} />
      <InputButton digit="3" onPress={onDigit} disabled={disabled} />
      <OperationSlot
        operation="add"
        activeOperation={operation}
        disabled={disabled}
        onAction={onAction}
      />

      <OperationSlot
        operation="power"
        activeOperation={operation}
        disabled={disabled}
        onAction={onAction}
        className="text-base"
      />
      <InputButton digit="0" onPress={onDigit} disabled={disabled} />
      <InputButton digit="." onPress={onDigit} disabled={disabled} />
      <ActionButton
        kind="equals"
        label="="
        ariaLabel="Equals"
        disabled={disabled}
        onPress={onAction}
      />
    </div>
  );
}
