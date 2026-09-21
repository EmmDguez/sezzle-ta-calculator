package handler_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/EmmDguez/sezzle-ta-calculator/sezzle-ta-calculator-be/internal/handler"
)

func TestHealthEndpoints(t *testing.T) {
	tests := []struct {
		name string
		fn   http.HandlerFunc
	}{
		{name: "livez", fn: handler.Livez},
		{name: "readyz", fn: handler.Readyz},
		{name: "health", fn: handler.Health},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/"+tc.name, nil)
			rec := httptest.NewRecorder()
			tc.fn(rec, req)

			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d, want %d", rec.Code, http.StatusOK)
			}

			var got struct {
				Status string `json:"status"`
			}
			if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
				t.Fatalf("decoding response: %v (body: %s)", err, rec.Body.String())
			}
			if got.Status != "ok" {
				t.Fatalf("status field = %q, want %q", got.Status, "ok")
			}
		})
	}
}
