package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-playground/validator/v10"

	"github.com/EmmDguez/sezzle-ta-calculator/sezzle-ta-calculator-be/internal/calculator"
	"github.com/EmmDguez/sezzle-ta-calculator/sezzle-ta-calculator-be/internal/validate"
)

type calculateRequest struct {
	Operation *string  `json:"operation" validate:"required"`
	Left      *float64 `json:"left" validate:"required"`
	Right     *float64 `json:"right"`
}

type calculateResponse struct {
	Result float64 `json:"result"`
}

type errorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(errorResponse{Error: code, Message: message})
}

// Calculate handles POST /api/v1/calculate as described in CONTRACT.md.
func Calculate(w http.ResponseWriter, r *http.Request) {
	var req calculateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// typeErr.Field is empty when the mismatch is on the body itself
		// (e.g. a JSON array or scalar instead of an object) rather than on
		// one of the struct's fields; that case has no field name to report
		// and is better described as invalid_json.
		if typeErr, ok := errors.AsType[*json.UnmarshalTypeError](err); ok && typeErr.Field != "" {
			writeError(w, http.StatusBadRequest, "wrong_type", "field ["+typeErr.Field+"] is not of expected type")
			return
		}
		writeError(w, http.StatusBadRequest, "invalid_json", "body isn't valid JSON")
		return
	}

	if err := validate.Struct(req); err != nil {
		if verrs, ok := errors.AsType[validator.ValidationErrors](err); ok && len(verrs) > 0 {
			field := verrs[0].Field()
			writeError(w, http.StatusBadRequest, "missing_field", "missing required field ["+field+"]")
			return
		}
		writeError(w, http.StatusBadRequest, "invalid_json", "body isn't valid JSON")
		return
	}

	operation := *req.Operation
	if !calculator.Supported(operation) {
		writeError(w, http.StatusBadRequest, "unsupported_operation", "operation is not supported")
		return
	}

	if operation == "sqrt" && req.Right != nil {
		writeError(w, http.StatusBadRequest, "unsupported_operation", "sqrt does not accept a right operand")
		return
	}

	if operation != "sqrt" && req.Right == nil {
		writeError(w, http.StatusBadRequest, "missing_field", "missing required field [right]")
		return
	}

	var right float64
	if req.Right != nil {
		right = *req.Right
	}

	result, err := calculator.Calculate(operation, *req.Left, right)
	if err != nil {
		// calculator.Calculate only ever returns *calculator.Error; the
		// fallback below is defensive and not expected to be reachable.
		if calcErr, ok := errors.AsType[*calculator.Error](err); ok {
			writeError(w, http.StatusUnprocessableEntity, calcErr.Code, calcErr.Message)
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "unexpected error")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(calculateResponse{Result: result})
}
