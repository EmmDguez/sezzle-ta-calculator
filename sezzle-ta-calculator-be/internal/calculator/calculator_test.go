package calculator_test

import (
	"errors"
	"testing"

	"github.com/EmmDguez/sezzle-ta-calculator/sezzle-ta-calculator-be/internal/calculator"
)

// TestCalculate covers every calculator-level scenario in CONTRACT.md's
// test scenario table (the "substract | | | 400 missing_field" row is
// HTTP/validation-level only and belongs to the handler tests instead,
// since calculator.Subtract only accepts float64 and can't represent
// "missing").
func TestCalculate(t *testing.T) {
	tests := []struct {
		name        string
		op          string
		left, right float64
		wantResult  float64
		wantErrCode string
	}{
		{name: "add", op: "add", left: 2, right: 3, wantResult: 5},
		{name: "add_overflow", op: "add", left: 9007199254740991, right: 1, wantErrCode: "overflow"},
		{name: "substract", op: "substract", left: 300, right: 100, wantResult: 200},
		{name: "multiply", op: "multiply", left: 100, right: 200, wantResult: 20000},
		{name: "multiply_negative", op: "multiply", left: -100, right: 200, wantResult: -20000},
		{name: "multiply_overflow", op: "multiply", left: 9007199254740991, right: 2, wantErrCode: "overflow"},
		{name: "divide", op: "divide", left: 100, right: 33, wantResult: 3.0303},
		{name: "divide_by_zero", op: "divide", left: 30, right: 0, wantErrCode: "division_by_zero"},
		{name: "sqrt_negative", op: "sqrt", left: -1, right: 0, wantErrCode: "negative_sqrt"},
		{name: "sqrt", op: "sqrt", left: 25, right: 0, wantResult: 5},
		{name: "unsupported_op", op: "percentage", left: 10, right: 10, wantErrCode: "unsupported_operation"},
		{name: "power_overflow", op: "power", left: 2, right: 54, wantErrCode: "overflow"},
		{name: "power", op: "power", left: 5, right: 4, wantResult: 625},

		// Decimal scenarios added to CONTRACT.md by this story.
		{name: "decimal_add", op: "add", left: 2.5, right: 3.25, wantResult: 5.75},
		{name: "decimal_substract", op: "substract", left: 10.75, right: 4.5, wantResult: 6.25},
		{name: "decimal_multiply_precision", op: "multiply", left: 0.1, right: 0.2, wantResult: 0.02},
		{name: "decimal_divide_rounding", op: "divide", left: 1, right: 3, wantResult: 0.3333},
		{name: "decimal_power", op: "power", left: 2, right: 0.5, wantResult: 1.4142},
		{name: "decimal_sqrt", op: "sqrt", left: 2, right: 0, wantResult: 1.4142},

		// Regression: round4 must not corrupt large exact-integer results
		// (see roundSafeLimit) -- previously Add(9007199254740990, 1)
		// silently returned 9007199254740990 instead of the correct
		// 9007199254740991.
		{name: "add_no_precision_loss_near_max", op: "add", left: 9007199254740990, right: 1, wantResult: 9007199254740991},
		// Power's invalid math domain (negative base, fractional exponent)
		// must not be conflated with magnitude overflow.
		{name: "power_invalid_domain", op: "power", left: -8, right: 0.5, wantErrCode: "invalid_operation"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got, err := calculator.Calculate(tc.op, tc.left, tc.right)

			if tc.wantErrCode != "" {
				var calcErr *calculator.Error
				if !errors.As(err, &calcErr) {
					t.Fatalf("Calculate(%q, %v, %v) error = %v, want *calculator.Error with code %q",
						tc.op, tc.left, tc.right, err, tc.wantErrCode)
				}
				if calcErr.Code != tc.wantErrCode {
					t.Fatalf("Calculate(%q, %v, %v) error code = %q, want %q",
						tc.op, tc.left, tc.right, calcErr.Code, tc.wantErrCode)
				}
				return
			}

			if err != nil {
				t.Fatalf("Calculate(%q, %v, %v) unexpected error: %v", tc.op, tc.left, tc.right, err)
			}
			if got != tc.wantResult {
				t.Fatalf("Calculate(%q, %v, %v) = %v, want %v", tc.op, tc.left, tc.right, got, tc.wantResult)
			}
		})
	}
}

// TestOverflowPrecedence locks in that an input already past MaxSafeInteger
// is caught before an operation's own domain check runs.
func TestOverflowPrecedence(t *testing.T) {
	t.Run("sqrt_input_overflow_beats_negative_check", func(t *testing.T) {
		_, err := calculator.Sqrt(-9007199254740992, 0)
		var calcErr *calculator.Error
		if !errors.As(err, &calcErr) || calcErr.Code != "overflow" {
			t.Fatalf("Sqrt(-9007199254740992, 0) error = %v, want overflow", err)
		}
	})

	t.Run("divide_input_overflow_beats_division_by_zero", func(t *testing.T) {
		_, err := calculator.Divide(9007199254740992, 0)
		var calcErr *calculator.Error
		if !errors.As(err, &calcErr) || calcErr.Code != "overflow" {
			t.Fatalf("Divide(9007199254740992, 0) error = %v, want overflow", err)
		}
	})
}

func TestSupported(t *testing.T) {
	for _, op := range []string{"add", "substract", "multiply", "divide", "power", "sqrt"} {
		if !calculator.Supported(op) {
			t.Errorf("Supported(%q) = false, want true", op)
		}
	}
	if calculator.Supported("percentage") {
		t.Error("Supported(\"percentage\") = true, want false")
	}
}
