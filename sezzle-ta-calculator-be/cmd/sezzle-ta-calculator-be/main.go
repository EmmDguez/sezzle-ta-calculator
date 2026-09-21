// Command sezzle-ta-calculator-be starts the API HTTP server.
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/EmmDguez/sezzle-ta-calculator/sezzle-ta-calculator-be/internal/server"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router := server.NewRouter()

	log.Printf("listening on :%s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal(err)
	}
}
