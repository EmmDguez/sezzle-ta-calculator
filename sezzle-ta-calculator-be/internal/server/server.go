// Package server wires up the HTTP router and middleware for the API.
package server

import (
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/EmmDguez/sezzle-ta-calculator/sezzle-ta-calculator-be/internal/handler"
)

// defaultAllowedOrigin is the FE's origin per CONTRACT.md's CORS section
// (Story 1.3 made this the FE's port everywhere: dev, preview, and Docker).
const defaultAllowedOrigin = "http://localhost:4080"

// NewRouter builds the application's chi router with its routes registered.
func NewRouter() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	allowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = defaultAllowedOrigin
	}
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{allowedOrigin},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	}))

	r.Get("/livez", handler.Livez)
	r.Get("/readyz", handler.Readyz)
	r.Get("/health", handler.Health)

	r.Post("/api/v1/calculate", handler.Calculate)

	return r
}
