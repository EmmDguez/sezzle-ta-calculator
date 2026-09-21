package server_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/EmmDguez/sezzle-ta-calculator/sezzle-ta-calculator-be/internal/server"
)

// TestRoutes proves the routes are actually wired on the router. The
// handler-level tests call handlers directly and bypass routing entirely,
// so this is the only place a routing regression (wrong path, wrong
// method, or a route left off) would be caught.
func TestRoutes(t *testing.T) {
	r := server.NewRouter()

	tests := []struct {
		name       string
		method     string
		path       string
		body       string
		wantStatus int
	}{
		{name: "livez", method: http.MethodGet, path: "/livez", wantStatus: http.StatusOK},
		{name: "readyz", method: http.MethodGet, path: "/readyz", wantStatus: http.StatusOK},
		{name: "health", method: http.MethodGet, path: "/health", wantStatus: http.StatusOK},
		{name: "old_healthz_gone", method: http.MethodGet, path: "/healthz", wantStatus: http.StatusNotFound},
		{
			name:       "calculate",
			method:     http.MethodPost,
			path:       "/api/v1/calculate",
			body:       `{"operation":"add","left":2,"right":3}`,
			wantStatus: http.StatusOK,
		},
		{name: "calculate_wrong_method", method: http.MethodGet, path: "/api/v1/calculate", wantStatus: http.StatusMethodNotAllowed},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, strings.NewReader(tc.body))
			rec := httptest.NewRecorder()
			r.ServeHTTP(rec, req)

			if rec.Code != tc.wantStatus {
				t.Fatalf("%s %s status = %d, want %d (body: %s)", tc.method, tc.path, rec.Code, tc.wantStatus, rec.Body.String())
			}
		})
	}
}
