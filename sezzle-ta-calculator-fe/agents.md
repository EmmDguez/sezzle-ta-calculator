# agents.md — sezzle-ta-calculator-fe

This is the frontend module of the sezzle-ta-calculator project: a
TypeScript/React single-page app built with Vite, styled with Tailwind CSS
and shadcn/ui.

See also the [root `agents.md`](../agents.md) for how this module fits into
the overall project, and read it if you haven't already.

## Contract comes first

[`../CONTRACT.md`](../CONTRACT.md) defines the API this frontend consumes and
the scenarios it must handle (happy paths, validation errors, edge cases).
**Before writing or changing any code here, verify `CONTRACT.md` already
describes the behavior you're about to build.** If it's missing, stale, or
ambiguous, update `CONTRACT.md` first as its own change, then implement
against it.

## Style guide

Follow the [Google TypeScript Style Guide](docs/tsguide.html)
(`docs/tsguide.html`, a local copy of
https://google.github.io/styleguide/tsguide.html). When in doubt about
formatting, naming, or TypeScript idioms, defer to it.

## Stack

- Node 24
- Vite (`react-ts` template) + React 19
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- shadcn/ui (components generated into `src/components/ui`, config in
  `components.json`) — add new components with `npx shadcn@latest add <name>`
  rather than hand-rolling primitives it already provides
- Path alias `@/*` → `./src/*` (configured in `tsconfig.app.json` and
  `vite.config.ts`)

## Commands

```bash
npm install       # install dependencies
npm run dev        # start the Vite dev server
npm run build       # type-check (tsc -b) and produce a production build in dist/
npm run preview      # serve the production build locally
npm run lint       # oxlint
```

There is no test runner configured yet — add one (and the corresponding
script) when the first test is written, driven by scenarios in
`../CONTRACT.md`.

## Docker

`Dockerfile` is a two-stage build: `node:24-alpine` builds the app with
`npm ci && npm run build`, and `nginx:1.27-alpine` serves the resulting
`dist/` on port 4080 (`nginx.conf` rewrites unmatched paths to `index.html`
for client-side routing). 4080 is also the port used by `npm run dev` and
`npm run preview` (set via `server.port`/`preview.port` in `vite.config.ts`),
so the FE uses one consistent port everywhere.

```bash
docker build -t sezzle-ta-calculator-fe .
docker run -p 4080:4080 sezzle-ta-calculator-fe
```
