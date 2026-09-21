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

The dev server starts on **http://localhost:5173** by default (Vite prints
the exact URL on startup).

### Validate it's running

```bash
curl -sf http://localhost:5173/ > /dev/null && echo "FE dev server OK"
```

Or just open http://localhost:5173 in a browser and confirm the page loads.

## Other commands

```bash
npm run build     # type-check (tsc -b) and produce a production build in dist/
npm run preview   # serve the production build locally (defaults to http://localhost:4173)
npm run lint      # oxlint
```

## Run with Docker

```bash
docker build -t sezzle-ta-calculator-fe .
docker run --rm -p 4080:8080 sezzle-ta-calculator-fe
```

This builds the app with `node:24-alpine` and serves the static output with
`nginx:1.27-alpine` on port 8080.

### Validate the container is running

```bash
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:4080/
```

Expect `200`. You can also open http://localhost:4080 in a browser.
