// Package handler contains the HTTP handlers exposed by the API.
package handler

import (
	"encoding/json"
	"net/http"
)

// Health reports basic liveness of the service.
func Health(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
