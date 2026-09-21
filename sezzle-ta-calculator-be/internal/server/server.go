// Package server wires up the HTTP router and middleware for the API.
package server

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/EmmDguez/sezzle-ta-calculator/sezzle-ta-calculator-be/internal/handler"
)

// NewRouter builds the application's chi router with its routes registered.
func NewRouter() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/healthz", handler.Health)

	return r
}
