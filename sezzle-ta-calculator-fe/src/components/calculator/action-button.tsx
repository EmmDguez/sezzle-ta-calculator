import { cn } from "cn";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { ActionKind } from "@/types/calculator";

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

const VARIANT_BY_KIND: Record<
  "all-clear" | "clear" | "equals" | "operation",
  ButtonVariant
> = {
  "all-clear": "destructive",
  clear: "outline",
  operation: "outline",
  equals: "default",
};

function variantForKind(kind: ActionKind): ButtonVariant {
  if (kind === "all-clear" || kind === "clear" || kind === "equals") {
    return VARIANT_BY_KIND[kind];
  }
  return VARIANT_BY_KIND.operation;
}

interface ActionButtonProps {
  kind: ActionKind;
  label: string;
  ariaLabel: string;
  active?: boolean;
  disabled?: boolean;
  onPress: (kind: ActionKind) => void;
  className?: string;
}

/** AC / C / operation / equals key — wired to calculator-shell's state machine. */
export function ActionButton({
  kind,
  label,
  ariaLabel,
  active = false,
  disabled = false,
  onPress,
  className,
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant={variantForKind(kind)}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "aspect-square w-full text-xl font-normal",
        active && "ring-3 ring-ring/50",
        className,
      )}
      onClick={() => onPress(kind)}
      aria-label={ariaLabel}
    >
      {label}
    </Button>
  );
}
