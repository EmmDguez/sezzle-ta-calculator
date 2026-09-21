# sezzle-ta-calculator-be

Backend for the Sezzle TA calculator: a Go HTTP API built with
[chi](https://github.com/go-chi/chi) for routing and middleware (including
[go-chi/cors](https://github.com/go-chi/cors) for the FE's cross-origin
requests) and [go-playground/validator](https://github.com/go-playground/validator)
for request validation.

See [`agents.md`](./agents.md) for coding conventions, project layout, and
the style guide, and the [root `agents.md`](../agents.md) /
[`CONTRACT.md`](../CONTRACT.md) for how this module fits into the overall
project and the API it exposes.

## Requirements

| Tool | Version |
| --- | --- |
| [Go](https://go.dev/dl/) | go1.26.0 linux/amd64 |
| Docker | any recent version (only needed to build/run the container image) |

## Run locally

```bash
go run ./cmd/sezzle-ta-calculator-be
```

The server listens on **http://localhost:8090** by default (the same port
used when running via Docker below). Set `PORT` to change it:

```bash
PORT=9090 go run ./cmd/sezzle-ta-calculator-be
```

CORS is enabled for the FE's origin, `http://localhost:4080` by default
(matching the FE's dev/preview/Docker port — see CONTRACT.md's CORS
section). Set `CORS_ALLOWED_ORIGIN` to change it:

```bash
CORS_ALLOWED_ORIGIN=http://localhost:5173 go run ./cmd/sezzle-ta-calculator-be
```

### Validate it's running

```bash
curl -sf http://localhost:8090/health
```

Expect `{"status":"ok"}` with an HTTP 200. Kubernetes-style liveness/readiness
probes are also available at `/livez` and `/readyz`.

## API

### POST /api/v1/calculate

Performs a calculator operation. See [`../CONTRACT.md`](../CONTRACT.md) for
the full request/response shape, supported operations, and error codes.

```bash
curl -s -X POST http://localhost:8090/api/v1/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"add","left":2,"right":3}'
# {"result":5}
```

## Other commands

```bash
go build ./...                             # build everything
go vet ./...                              # vet
gofmt -l .                               # check formatting (should print nothing)
go test ./...                             # run all tests
go test ./internal/handler/... -run TestFoo   # run a single test
go mod tidy                              # sync go.mod/go.sum after adding imports
```

## Run with Docker

```bash
docker build -t sezzle-ta-calculator-be .
docker run --rm -p 8090:8090 sezzle-ta-calculator-be
```

This builds a static binary with `golang:1.26-alpine` and runs it as
`nonroot` on `gcr.io/distroless/static-debian12:latest`, listening on port
8090 inside the container — the same port used when running locally above,
so every example on this page uses port 8090 either way.

### Validate the container is running

```bash
curl -sf http://localhost:8090/health
```

Expect `{"status":"ok"}` with an HTTP 200.
