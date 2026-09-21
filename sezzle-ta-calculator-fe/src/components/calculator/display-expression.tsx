interface DisplayExpressionProps {
  value: string;
}

/** Smaller line above display-main showing the prior operation, if any. */
export function DisplayExpression({ value }: DisplayExpressionProps) {
  return (
    <div className="min-h-5 truncate text-right font-sans text-sm text-muted-foreground tabular-nums">
      {value || " "}
    </div>
  );
}
