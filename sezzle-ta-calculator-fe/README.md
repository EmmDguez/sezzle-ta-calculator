# sezzle-ta-calculator-fe

Frontend for the Sezzle TA calculator: a TypeScript/React single-page app
built with Vite, styled with Tailwind CSS and shadcn/ui.

See [`agents.md`](./agents.md) for coding conventions and the style guide,
and the [root `agents.md`](../agents.md) / [`CONTRACT.md`](../CONTRACT.md)
for how this module fits into the overall project and the API it consumes.

## Requirements

| Tool | Version |
| --- | --- |
| [Node.js](https://nodejs.org/) | 24.x |
| npm | bundled with Node 24 (11.x) |
| Docker | any recent version (only needed to build/run the container image) |

## Run locally

```bash
npm install
npm run dev
```

The dev server starts on **http://localhost:4080** (fixed via `server.port` in
`vite.config.ts`, with `strictPort: true` so it fails instead of silently
picking a different port if 4080 is already in use).

### Validate it's running

```bash
curl -sf http://localhost:4080/ > /dev/null && echo "FE dev server OK"
```

Or just open http://localhost:4080 in a browser and confirm the page loads.

## Using the calculator

The app calls the backend's `POST /api/v1/calculate` directly from the
browser (see [`../CONTRACT.md`](../CONTRACT.md)), so **the BE must also be
running** — either `go run ./cmd/sezzle-ta-calculator-be` in
`sezzle-ta-calculator-be/` (port 8090), or `docker compose up` from the
repo root, which starts both.

- Type digits with the numpad or your keyboard (`0`-`9`, `.`); `Backspace`
  clears the current entry (`C`), `Escape` clears everything (`AC`).
- Pick an operation (`+ − × ÷ x^y √`) and, for every operation except `√`,
  type a second number, then press `=` (or `Enter`) to send it to the BE.
  `√` is unary and computes as soon as it's clicked/pressed on whatever
  number is currently shown.
- You can chain operations without pressing `=` in between — e.g.
  `5 + 3 +` immediately computes `5 + 3` and starts the next operation
  from `8`.
- A rejected calculation (e.g. dividing by zero) shows `ERR`; if the BE
  can't be reached at all, the display shows `UNAVAILABLE`. Either clears
  on `AC`, `C`, or typing a new number.
- By default the app targets the BE on the page's own host, port 8090
  (`http://<host>:8090`) — matching both local dev and the docker-compose
  setup. Override it for other deployments with a `VITE_API_BASE_URL`
  build-time env var (e.g. `VITE_API_BASE_URL=https://api.example.com`).

## Other commands

```bash
npm run build     # type-check (tsc -b) and produce a production build in dist/
npm run preview   # serve the production build locally (http://localhost:4080, same port as dev)
npm run lint      # oxlint
npm run test      # run the unit test suite (Vitest)
npm run coverage  # run the suite with a coverage report (text summary + coverage/index.html)
```

Unit tests cover `src/lib/` — the digit/number formatting rules and the BE
API client — against `../CONTRACT.md`'s request/response shapes and error
codes. See the root [`README.md`](../README.md) for a current coverage
snapshot.

## Run with Docker

```bash
docker build -t sezzle-ta-calculator-fe .
docker run --rm -p 4080:4080 sezzle-ta-calculator-fe
```

This builds the app with `node:24-alpine` and serves the static output with
`nginx:1.27-alpine` on port 4080 — the same port used for local dev and
preview, so there's only one FE port to remember.

### Validate the container is running

```bash
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:4080/
```

Expect `200`. You can also open http://localhost:4080 in a browser.
