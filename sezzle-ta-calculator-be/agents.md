# agents.md — sezzle-ta-calculator-be

This is the backend module of the sezzle-ta-calculator project: a Go HTTP
API built with [chi](https://github.com/go-chi/chi) for routing and
[go-playground/validator](https://github.com/go-playground/validator) for
request validation.

See also the [root `agents.md`](../agents.md) for how this module fits into
the overall project, and read it if you haven't already.

## Contract comes first

[`../CONTRACT.md`](../CONTRACT.md) defines the API this service exposes and
the scenarios it must handle (happy paths, validation errors, edge cases).
**Before writing or changing any code here, verify `CONTRACT.md` already
describes the behavior you're about to build.** If it's missing, stale, or
ambiguous, update `CONTRACT.md` first as its own change, then implement
against it.

## Style guide

Follow the [Google Go Style Guide](docs/go-styleguide-index.html) — local
copies of https://google.github.io/styleguide/go/ are in `docs/`:

- `go-styleguide-index.html` — overview / how the guide is organized
- `go-styleguide-guide.html` — the core style guide
- `go-styleguide-decisions.html` — style decisions
- `go-styleguide-best-practices.html` — best practices

When in doubt about formatting, naming, or Go idioms, defer to these over
personal preference. `gofmt`/`go vet` must be clean before committing.

## Stack & layout

- Go 1.26.0 (`go 1.26.0` in `go.mod`), module
  `github.com/EmmDguez/sezzle-ta-calculator/sezzle-ta-calculator-be`
- Standard Go project layout:
  - `cmd/sezzle-ta-calculator-be/main.go` — entrypoint, wires up and starts
    the HTTP server (`PORT` env var, defaults to `8080`)
  - `internal/server` — chi router construction and route registration
  - `internal/handler` — HTTP handlers
  - `internal/validate` — shared `go-playground/validator` instance for
    validating request payloads (`validate.Struct`)
- [chi](https://github.com/go-chi/chi) for routing and middleware
  (`middleware.RequestID`, `middleware.Logger`, `middleware.Recoverer` are
  wired in `internal/server`)

## Commands

```bash
go build ./...                              # build everything
go run ./cmd/sezzle-ta-calculator-be          # run the server locally (port 8080)
go vet ./...                                # vet
gofmt -l .                                # check formatting (should print nothing)
go test ./...                              # run all tests
go test ./internal/handler/... -run TestFoo    # run a single test
go mod tidy                                # sync go.mod/go.sum after adding imports
```

There are no tests yet — add them (unit tests per package, and any
integration tests the contract calls for) driven by the scenarios in
`../CONTRACT.md`.

## Docker

`Dockerfile` is a two-stage build: `golang:1.26-alpine` compiles a static
binary (`CGO_ENABLED=0`), and
`gcr.io/distroless/static-debian12:latest` runs it as `nonroot` on port
8080.

```bash
docker build -t sezzle-ta-calculator-be .
docker run -p 8080:8080 sezzle-ta-calculator-be
```
