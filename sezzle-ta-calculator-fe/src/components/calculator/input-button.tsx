import { cn } from "cn";
import { Button } from "@/components/ui/button";

interface InputButtonProps {
  digit: string;
  onPress: (digit: string) => void;
  className?: string;
}

/** A numpad key (0-9 or "."). */
export function InputButton({ digit, onPress, className }: InputButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      className={cn("aspect-square w-full text-xl font-normal", className)}
      onClick={() => onPress(digit)}
      aria-label={digit === "." ? "Decimal point" : digit}
    >
      {digit}
    </Button>
  );
}
