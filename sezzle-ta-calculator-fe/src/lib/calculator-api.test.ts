import { afterEach, describe, expect, it, vi } from "vitest";
import { calculate } from "./calculator-api";

// Minimal fetch mock — enough of the Response shape for calculator-api.ts's
// `response.ok` / `response.json()` usage.
function mockFetchOnce(
  impl: () => Promise<{ ok: boolean; json: () => Promise<unknown> }>,
) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

function lastRequest() {
  const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
  return { url, init, body: JSON.parse(init.body as string) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("calculate — request shape (CONTRACT.md POST /api/v1/calculate)", () => {
  it("POSTs to /api/v1/calculate with a JSON content-type header", async () => {
    mockFetchOnce(async () => ({ ok: true, json: async () => ({ result: 5 }) }));

    await calculate("add", 2, 3);

    const { url, init } = lastRequest();
    expect(url).toContain("/api/v1/calculate");
    expect(url).toContain(":8090");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("sends operation/left/right for a binary operation", async () => {
    mockFetchOnce(async () => ({ ok: true, json: async () => ({ result: 5 }) }));

    await calculate("add", 2, 3);

    expect(lastRequest().body).toEqual({ operation: "add", left: 2, right: 3 });
  });

  it("omits `right` entirely for sqrt, per CONTRACT.md", async () => {
    mockFetchOnce(async () => ({ ok: true, json: async () => ({ result: 5 }) }));

    await calculate("sqrt", 25);

    const { body } = lastRequest();
    expect(body).toEqual({ operation: "sqrt", left: 25 });
    expect("right" in body).toBe(false);
  });
});

describe("calculate — response mapping", () => {
  it("maps a successful response to {ok: true, result}", async () => {
    mockFetchOnce(async () => ({ ok: true, json: async () => ({ result: 3.0303 }) }));

    await expect(calculate("divide", 100, 33)).resolves.toEqual({
      ok: true,
      result: 3.0303,
    });
  });

  it("maps a rejected calculation to {ok: false, kind: 'rejected', ...}", async () => {
    mockFetchOnce(async () => ({
      ok: false,
      json: async () => ({ error: "division_by_zero", message: "cannot divide by zero" }),
    }));

    await expect(calculate("divide", 30, 0)).resolves.toEqual({
      ok: false,
      kind: "rejected",
      error: "division_by_zero",
      message: "cannot divide by zero",
    });
  });

  it("maps a network failure to {ok: false, kind: 'unavailable'}", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    await expect(calculate("add", 1, 1)).resolves.toEqual({
      ok: false,
      kind: "unavailable",
    });
  });

  it("maps an unparseable response body to {ok: false, kind: 'unavailable'}", async () => {
    mockFetchOnce(async () => ({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    }));

    await expect(calculate("add", 1, 1)).resolves.toEqual({
      ok: false,
      kind: "unavailable",
    });
  });

  it("maps an unexpected success body shape to 'unavailable' rather than crashing", async () => {
    mockFetchOnce(async () => ({ ok: true, json: async () => ({}) }));

    await expect(calculate("add", 1, 1)).resolves.toEqual({
      ok: false,
      kind: "unavailable",
    });
  });

  it("maps an unexpected error body shape to 'unavailable' rather than a bogus 'rejected'", async () => {
    mockFetchOnce(async () => ({ ok: false, json: async () => ({}) }));

    await expect(calculate("add", 1, 1)).resolves.toEqual({
      ok: false,
      kind: "unavailable",
    });
  });
});
