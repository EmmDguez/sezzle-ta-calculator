import type { Operation } from "@/types/calculator";

export type CalculateResult =
  | { ok: true; result: number }
  | { ok: false; kind: "rejected"; error: string; message: string }
  | { ok: false; kind: "unavailable" };

// The BE is a different origin than the FE (Story 1.3 fixed the FE at
// :4080, the BE at :8090, both locally and via docker-compose), so the
// default target is the current page's host on the BE's port. Story 1.3.1
// added CORS support on the BE for exactly this cross-origin call.
const DEFAULT_API_BASE = `${window.location.protocol}//${window.location.hostname}:8090`;
const API_BASE = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE;

interface ResultPayload {
  result: number;
}

interface ErrorPayload {
  error: string;
  message: string;
}

function isResultPayload(value: unknown): value is ResultPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { result?: unknown }).result === "number"
  );
}

function isErrorPayload(value: unknown): value is ErrorPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { error?: unknown }).error === "string" &&
    typeof (value as { message?: unknown }).message === "string"
  );
}

/**
 * Calls POST /api/v1/calculate per CONTRACT.md. `right` is omitted from
 * the request body entirely when undefined, since CONTRACT.md rejects
 * `sqrt` requests that include `right` at all (even as an explicit value).
 */
export async function calculate(
  operation: Operation,
  left: number,
  right?: number,
): Promise<CalculateResult> {
  const body: Record<string, unknown> = { operation, left };
  if (right !== undefined) {
    body.right = right;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/v1/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, kind: "unavailable" };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, kind: "unavailable" };
  }

  if (response.ok && isResultPayload(payload)) {
    return { ok: true, result: payload.result };
  }
  if (!response.ok && isErrorPayload(payload)) {
    return {
      ok: false,
      kind: "rejected",
      error: payload.error,
      message: payload.message,
    };
  }
  return { ok: false, kind: "unavailable" };
}
