# sezzle-ta-calculator

Repo for technical assessment: a calculator application split into two
independently deployable modules — a Go HTTP API and a TypeScript/React SPA.
See:

- [`agents.md`](./agents.md) for the repository layout and conventions.
- [`CONTRACT.md`](./CONTRACT.md) for the API contract both modules implement
  against.
- [`Planning/`](./Planning) for the epics/stories and sprint status tracking
  this project was built against.
- [`prompts.md`](./prompts.md) for the prompts used to build this project.

## Run everything with Docker Compose

Requires Docker with the `docker compose` plugin.

```bash
docker compose up --build
```

This builds and starts both services:

- API — http://localhost:8090 (see [`CONTRACT.md`](./CONTRACT.md) for
  endpoints; try `curl http://localhost:8090/livez`)
- UI — http://localhost:4080

Stop everything with `docker compose down` (add `-v` to also remove any
volumes, though this project currently has none).

## Run a module standalone

Each module also runs on its own, without Docker, for local development. See:

- [`sezzle-ta-calculator-be/README.md`](./sezzle-ta-calculator-be/README.md)
- [`sezzle-ta-calculator-fe/README.md`](./sezzle-ta-calculator-fe/README.md)

## Testing & coverage

Both modules have unit tests, each driven by [`CONTRACT.md`](./CONTRACT.md)'s
request/response shapes, error codes, and test-scenario table.

```bash
# BE — from sezzle-ta-calculator-be/
go test ./... -coverpkg=./... -coverprofile=coverage.out
go tool cover -func=coverage.out

# FE — from sezzle-ta-calculator-fe/
npm run coverage
```

Coverage snapshot as of this commit (re-run the commands above for the
current numbers — this is a point-in-time capture, not a maintained badge):

| Module | Scope | Stmts | Branch | Funcs |
| --- | --- | --- | --- | --- |
| BE (`go test ./... -coverpkg=./...`) | whole module (`cmd/` excluded — it's just the entrypoint) | 84.2% | — (Go's tool doesn't report branch %) | — |
| FE (`npm run coverage`) | `src/lib/` — digit/number formatting + the BE API client | 97.4% | 95.7% | 100% |

The FE's coverage is intentionally scoped to `src/lib/` (pure logic, no
React) rather than the whole `src/` tree: component/UI behavior is verified
by hand in a real browser instead of with automated tests — see
`Planning/epics.md`'s implementation notes on each story for what was
checked. The BE's `internal/calculator`, `internal/handler`, and
`internal/server` packages are close to fully covered; `internal/validate`
has no test file of its own but is exercised indirectly through the
handler tests (hence `-coverpkg=./...` above, not plain `-cover`).

## 

* Using claude as an AI tool for development
* Created a contract.MD file to outline the api and behavior for both modules.
* Created an epics.md file to use as an input for the BMAD plugin
  * Keeping on file but would serve for tracking against a real ticketing.system like jira.
  * Ommitted percentage as it adds a layer of complexity over the operands, it would be a next story under this repo.
* Defined the requirements as stories in the epics.md file.
* Using Long Term Support versions for the services.
  * FE, is using node 24,tailwimd and shadcn/ui as supporting tools.
  * GO, is using chi, go-chi/cors, and validator. 
* Using max typescript int as self imposed calculator limit.
* Using 4 digits as self imposed decimal rounding in results.
