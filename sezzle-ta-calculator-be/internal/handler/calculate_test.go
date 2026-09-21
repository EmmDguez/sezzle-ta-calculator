package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/EmmDguez/sezzle-ta-calculator/sezzle-ta-calculator-be/internal/handler"
)

func doCalculate(t *testing.T, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", strings.NewReader(body))
	rec := httptest.NewRecorder()
	handler.Calculate(rec, req)
	return rec
}

func decodeError(t *testing.T, rec *httptest.ResponseRecorder) (code, message string) {
	t.Helper()
	var got struct {
		Error   string `json:"error"`
		Message string `json:"message"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatalf("decoding error response: %v (body: %s)", err, rec.Body.String())
	}
	return got.Error, got.Message
}

func decodeResult(t *testing.T, rec *httptest.ResponseRecorder) float64 {
	t.Helper()
	var got struct {
		Result float64 `json:"result"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatalf("decoding result response: %v (body: %s)", err, rec.Body.String())
	}
	return got.Result
}

func TestCalculateSuccess(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantResult float64
	}{
		{name: "add", body: `{"operation":"add","left":2,"right":3}`, wantResult: 5},
		{name: "sqrt_no_right", body: `{"operation":"sqrt","left":25}`, wantResult: 5},
		{name: "decimal_divide", body: `{"operation":"divide","left":1,"right":3}`, wantResult: 0.3333},
		// Explicit zero must not be treated as "missing" -- this is the
		// entire point of using *float64 for Left/Right.
		{name: "explicit_zero_left", body: `{"operation":"add","left":0,"right":5}`, wantResult: 5},
		{name: "explicit_zero_right", body: `{"operation":"multiply","left":5,"right":0}`, wantResult: 0},
		// Regression: round4 must not corrupt large exact-integer results.
		{name: "add_no_precision_loss_near_max", body: `{"operation":"add","left":9007199254740990,"right":1}`, wantResult: 9007199254740991},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			rec := doCalculate(t, tc.body)
			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d (body: %s)", rec.Code, http.StatusOK, rec.Body.String())
			}
			if got := decodeResult(t, rec); got != tc.wantResult {
				t.Fatalf("result = %v, want %v", got, tc.wantResult)
			}
		})
	}
}

func TestCalculateErrors(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantStatus int
		wantCode   string
	}{
		{name: "malformed_json", body: `{"operation":"add","left":2,`, wantStatus: http.StatusBadRequest, wantCode: "invalid_json"},
		{name: "empty_body", body: ``, wantStatus: http.StatusBadRequest, wantCode: "invalid_json"},
		{name: "non_object_body", body: `[1,2,3]`, wantStatus: http.StatusBadRequest, wantCode: "invalid_json"},
		{name: "wrong_type_right", body: `{"operation":"add","left":2,"right":"abc"}`, wantStatus: http.StatusBadRequest, wantCode: "wrong_type"},
		{name: "missing_operation", body: `{"left":2,"right":3}`, wantStatus: http.StatusBadRequest, wantCode: "missing_field"},
		{name: "missing_left", body: `{"operation":"add","right":3}`, wantStatus: http.StatusBadRequest, wantCode: "missing_field"},
		{name: "missing_right_non_sqrt", body: `{"operation":"add","left":2}`, wantStatus: http.StatusBadRequest, wantCode: "missing_field"},
		{name: "empty_object", body: `{}`, wantStatus: http.StatusBadRequest, wantCode: "missing_field"},
		{name: "unsupported_operation", body: `{"operation":"percentage","left":10,"right":10}`, wantStatus: http.StatusBadRequest, wantCode: "unsupported_operation"},
		{name: "sqrt_with_right_present", body: `{"operation":"sqrt","left":25,"right":5}`, wantStatus: http.StatusBadRequest, wantCode: "unsupported_operation"},
		{name: "sqrt_with_right_zero_present", body: `{"operation":"sqrt","left":25,"right":0}`, wantStatus: http.StatusBadRequest, wantCode: "unsupported_operation"},
		{name: "division_by_zero", body: `{"operation":"divide","left":30,"right":0}`, wantStatus: http.StatusUnprocessableEntity, wantCode: "division_by_zero"},
		{name: "negative_sqrt", body: `{"operation":"sqrt","left":-1}`, wantStatus: http.StatusUnprocessableEntity, wantCode: "negative_sqrt"},
		{name: "overflow_add", body: `{"operation":"add","left":9007199254740991,"right":1}`, wantStatus: http.StatusUnprocessableEntity, wantCode: "overflow"},
		{name: "overflow_multiply", body: `{"operation":"multiply","left":9007199254740991,"right":2}`, wantStatus: http.StatusUnprocessableEntity, wantCode: "overflow"},
		{name: "overflow_power", body: `{"operation":"power","left":2,"right":54}`, wantStatus: http.StatusUnprocessableEntity, wantCode: "overflow"},
		{name: "power_invalid_domain", body: `{"operation":"power","left":-8,"right":0.5}`, wantStatus: http.StatusUnprocessableEntity, wantCode: "invalid_operation"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			rec := doCalculate(t, tc.body)
			if rec.Code != tc.wantStatus {
				t.Fatalf("status = %d, want %d (body: %s)", rec.Code, tc.wantStatus, rec.Body.String())
			}
			code, message := decodeError(t, rec)
			if code != tc.wantCode {
				t.Fatalf("error code = %q, want %q (message: %q)", code, tc.wantCode, message)
			}
		})
	}
}

func TestCalculateWrongTypeMessageNamesField(t *testing.T) {
	rec := doCalculate(t, `{"operation":"add","left":2,"right":"abc"}`)
	_, message := decodeError(t, rec)
	if !strings.Contains(message, "right") {
		t.Fatalf("wrong_type message = %q, want it to mention field %q", message, "right")
	}
}
