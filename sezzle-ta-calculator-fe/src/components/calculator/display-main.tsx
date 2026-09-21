import { MAX_SAFE_INTEGER_VALUE } from "@/lib/number-input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DisplayMainProps {
  value: string;
  isError: boolean;
}

/** The calculator's primary input/output panel — reads like an instrument's LCD, not a card. */
export function DisplayMain({ value, isError }: DisplayMainProps) {
  const shown = isError ? "ERR" : value || "0";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="mt-1 mb-4 truncate rounded-xl border border-border bg-background px-4 py-3 text-right font-sans text-5xl font-medium tabular-nums text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-6xl"
          aria-live="polite"
          tabIndex={0}
        >
          {shown}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Maximum value: {MAX_SAFE_INTEGER_VALUE.toLocaleString()} (Number.MAX_SAFE_INTEGER)
      </TooltipContent>
    </Tooltip>
  );
}
