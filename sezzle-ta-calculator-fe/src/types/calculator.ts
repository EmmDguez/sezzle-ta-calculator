// Operation identifiers match CONTRACT.md's `operation` field exactly so
// Story 1.4 can reuse this vocabulary for the real API payload unchanged.
export type Operation =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "power"
  | "sqrt";

export type ActionKind = "all-clear" | "clear" | "equals" | Operation;
