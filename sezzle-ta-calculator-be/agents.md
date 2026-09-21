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
    the HTTP server (`PORT` env var, defaults to `8090` — the same port used
    in the Docker image, so local and containerized runs agree)
  - `internal/server` — chi router construction and route registration
  - `internal/handler` — HTTP handlers
  - `internal/validate` — shared `go-playground/validator` instance for
    validating request payloads (`validate.Struct`)
  - `internal/calculator` — the calculator operations, each as its own
    method (`Add`, `Subtract`, `Multiply`, `Divide`, `Power`, `Sqrt`),
    dispatched by `Calculate`/`Supported`
- [chi](https://github.com/go-chi/chi) for routing and middleware
  (`middleware.RequestID`, `middleware.Logger`, `middleware.Recoverer` are
  wired in `internal/server`)

## Commands

```bash
go build ./...                              # build everything
go run ./cmd/sezzle-ta-calculator-be          # run the server locally (port 8090)
go vet ./...                                # vet
gofmt -l .                                # check formatting (should print nothing)
go test ./...                              # run all tests
go test ./internal/handler/... -run TestFoo    # run a single test
go mod tidy                                # sync go.mod/go.sum after adding imports
```

Each package under `internal/` has table-driven tests keyed to
`../CONTRACT.md`'s test scenario table (`internal/calculator`,
`internal/handler`) plus a routing-level test (`internal/server`) that
proves routes are actually wired, since the handler tests call handlers
directly and bypass routing. Add new cases there as `../CONTRACT.md` grows.

## Docker

`Dockerfile` is a two-stage build: `golang:1.26-alpine` compiles a static
binary (`CGO_ENABLED=0`), and
`gcr.io/distroless/static-debian12:latest` runs it as `nonroot` on port
8090 — the same port used when running locally, so no port translation is
needed between the two.

```bash
docker build -t sezzle-ta-calculator-be .
docker run -p 8090:8090 sezzle-ta-calculator-be
```
