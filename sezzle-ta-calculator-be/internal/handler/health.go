// Package handler contains the HTTP handlers exposed by the API.
package handler

import (
	"encoding/json"
	"net/http"
)

func writeStatusOK(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// Livez reports basic liveness of the service.
func Livez(w http.ResponseWriter, r *http.Request) {
	writeStatusOK(w)
}

// Readyz reports whether the service is ready to accept traffic.
func Readyz(w http.ResponseWriter, r *http.Request) {
	writeStatusOK(w)
}

// Health serves GET /health, the backwards-compatible health check per
// CONTRACT.md (distinct from the newer /livez and /readyz probes).
func Health(w http.ResponseWriter, r *http.Request) {
	writeStatusOK(w)
}
