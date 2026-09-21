import { describe, expect, it } from "vitest";
import {
  MAX_SAFE_INTEGER_VALUE,
  appendDigit,
  isBlankOperand,
  normalizeLeadingZeros,
} from "./number-input";

describe("normalizeLeadingZeros", () => {
  it("strips leading zeros before a digit", () => {
    expect(normalizeLeadingZeros("007")).toBe("7");
  });

  it("collapses an all-zero string to a single zero", () => {
    expect(normalizeLeadingZeros("000")).toBe("0");
  });

  it("preserves the sign while stripping leading zeros", () => {
    expect(normalizeLeadingZeros("-007")).toBe("-7");
  });

  it("does not touch zeros before a decimal point", () => {
    expect(normalizeLeadingZeros("0.5")).toBe("0.5");
  });
});

describe("appendDigit — digit entry (Story 1.2 A/C)", () => {
  it("builds up a number one digit at a time", () => {
    expect(appendDigit("", "5").value).toBe("5");
    expect(appendDigit("5", "2").value).toBe("52");
  });

  it("strips a leading zero as soon as a real digit follows", () => {
    expect(appendDigit("0", "5")).toEqual({ value: "5", overflowed: false });
  });

  it("starts a decimal from blank as '0.'", () => {
    expect(appendDigit("", ".")).toEqual({ value: "0.", overflowed: false });
  });

  it("ignores a second decimal point", () => {
    expect(appendDigit("1.5", ".")).toEqual({
      value: "1.5",
      overflowed: false,
    });
  });

  it("rejects a keystroke that would exceed MAX_SAFE_INTEGER, leaving the value unchanged", () => {
    const atLimit = String(MAX_SAFE_INTEGER_VALUE);
    expect(appendDigit(atLimit, "1")).toEqual({
      value: atLimit,
      overflowed: true,
    });
  });

  it("allows a value exactly at MAX_SAFE_INTEGER", () => {
    const oneBelow = String(MAX_SAFE_INTEGER_VALUE).slice(0, -1);
    const lastDigit = String(MAX_SAFE_INTEGER_VALUE).slice(-1);
    expect(appendDigit(oneBelow, lastDigit)).toEqual({
      value: String(MAX_SAFE_INTEGER_VALUE),
      overflowed: false,
    });
  });
});

describe("appendDigit — negative number entry", () => {
  it("starts a negative number from a blank entry", () => {
    expect(appendDigit("", "-")).toEqual({ value: "-", overflowed: false });
  });

  it("is a no-op if a digit has already been entered", () => {
    expect(appendDigit("5", "-")).toEqual({ value: "5", overflowed: false });
  });

  it("appends digits after the leading minus sign", () => {
    expect(appendDigit("-", "1")).toEqual({ value: "-1", overflowed: false });
  });

  it("starts a negative decimal as '-0.'", () => {
    expect(appendDigit("-", ".")).toEqual({ value: "-0.", overflowed: false });
  });

  it("rejects overflow on the negative side of the range too", () => {
    const atLimit = `-${MAX_SAFE_INTEGER_VALUE}`;
    expect(appendDigit(atLimit, "0")).toEqual({
      value: atLimit,
      overflowed: true,
    });
  });
});

describe("isBlankOperand", () => {
  it.each(["", "-"])("treats %j as blank", (value) => {
    expect(isBlankOperand(value)).toBe(true);
  });

  it.each(["0", "-0", "5", "0."])("treats %j as a real operand", (value) => {
    expect(isBlankOperand(value)).toBe(false);
  });
});
