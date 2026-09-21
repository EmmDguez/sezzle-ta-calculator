import { cn } from "cn";
import { Button } from "@/components/ui/button";

interface InputButtonProps {
  digit: string;
  onPress: (digit: string) => void;
  disabled?: boolean;
  className?: string;
}

/** A numpad key (0-9 or "."). */
export function InputButton({
  digit,
  onPress,
  disabled = false,
  className,
}: InputButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      disabled={disabled}
      className={cn("aspect-square w-full text-xl font-normal", className)}
      onClick={() => onPress(digit)}
      aria-label={digit === "." ? "Decimal point" : digit}
    >
      {digit}
    </Button>
  );
}
