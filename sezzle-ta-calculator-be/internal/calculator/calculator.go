// Package calculator implements the calculator operations exposed by the
// API, each as its own method, per CONTRACT.md.
package calculator

import (
	"fmt"
	"math"
)

// MaxSafeInteger mirrors JavaScript's Number.MAX_SAFE_INTEGER (2^53 - 1),
// the overflow ceiling shared with the frontend per CONTRACT.md.
const MaxSafeInteger = 9007199254740991

// Error is a calculator-domain error carrying the CONTRACT.md error code.
type Error struct {
	Code    string
	Message string
}

func (e *Error) Error() string {
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func overflowErr() *Error {
	return &Error{Code: "overflow", Message: "number exceeds MAX_SAFE_INTEGER"}
}

func checkOverflow(values ...float64) error {
	for _, v := range values {
		if math.Abs(v) > MaxSafeInteger {
			return overflowErr()
		}
	}
	return nil
}

// roundSafeLimit is the largest magnitude for which v*10000 itself stays
// within float64's exactly-representable integer range (2^53). Above it,
// multiplying by 10000 before rounding would corrupt v.
const roundSafeLimit = (1 << 53) / 10000.0

// round4 rounds decimal results to the 4th decimal point, per Story 1.1's
// A/C. Values above roundSafeLimit are returned unchanged: at that
// magnitude v*10000 would itself lose precision (it would exceed float64's
// exact 2^53 integer range), so rounding via multiply/divide would corrupt
// the value instead of just rounding it — and there is no representable
// fractional part left to round away regardless.
func round4(v float64) float64 {
	if math.Abs(v) > roundSafeLimit {
		return v
	}
	return math.Round(v*10000) / 10000
}

// Add computes left + right.
func Add(left, right float64) (float64, error) {
	if err := checkOverflow(left, right); err != nil {
		return 0, err
	}
	result := left + right
	if err := checkOverflow(result); err != nil {
		return 0, err
	}
	return round4(result), nil
}

// Subtract computes left - right.
func Subtract(left, right float64) (float64, error) {
	if err := checkOverflow(left, right); err != nil {
		return 0, err
	}
	result := left - right
	if err := checkOverflow(result); err != nil {
		return 0, err
	}
	return round4(result), nil
}

// Multiply computes left * right.
func Multiply(left, right float64) (float64, error) {
	if err := checkOverflow(left, right); err != nil {
		return 0, err
	}
	result := left * right
	if err := checkOverflow(result); err != nil {
		return 0, err
	}
	return round4(result), nil
}

// Divide computes left / right.
func Divide(left, right float64) (float64, error) {
	if err := checkOverflow(left, right); err != nil {
		return 0, err
	}
	if right == 0 {
		return 0, &Error{Code: "division_by_zero", Message: "cannot divide by zero"}
	}
	result := left / right
	if err := checkOverflow(result); err != nil {
		return 0, err
	}
	return round4(result), nil
}

// Power computes left ^ right.
func Power(left, right float64) (float64, error) {
	if err := checkOverflow(left, right); err != nil {
		return 0, err
	}
	result := math.Pow(left, right)
	if math.IsInf(result, 0) {
		return 0, overflowErr()
	}
	if math.IsNaN(result) {
		// math.Pow returns NaN for invalid-domain inputs (e.g. a negative
		// base with a fractional exponent), which has nothing to do with
		// magnitude overflow, so it gets its own error code per CONTRACT.md
		// rather than being conflated with "overflow".
		return 0, &Error{Code: "invalid_operation", Message: "the operation is mathematically undefined for the given operands"}
	}
	if err := checkOverflow(result); err != nil {
		return 0, err
	}
	return round4(result), nil
}

// Sqrt computes the square root of left. right is accepted but unused so
// Sqrt satisfies the same signature as every other operation.
func Sqrt(left, _ float64) (float64, error) {
	if err := checkOverflow(left); err != nil {
		return 0, err
	}
	if left < 0 {
		return 0, &Error{Code: "negative_sqrt", Message: "cannot calculate negative sqrt"}
	}
	result := math.Sqrt(left)
	if err := checkOverflow(result); err != nil {
		return 0, err
	}
	return round4(result), nil
}

type operationFunc func(left, right float64) (float64, error)

var operations = map[string]operationFunc{
	"add":      Add,
	"subtract": Subtract,
	"multiply": Multiply,
	"divide":   Divide,
	"power":    Power,
	"sqrt":     Sqrt,
}

// Supported reports whether operation is one of the operations this package
// implements.
func Supported(operation string) bool {
	_, ok := operations[operation]
	return ok
}

// Calculate dispatches to the operation's own method.
func Calculate(operation string, left, right float64) (float64, error) {
	fn, ok := operations[operation]
	if !ok {
		return 0, &Error{Code: "unsupported_operation", Message: "operation is not supported"}
	}
	return fn(left, right)
}
