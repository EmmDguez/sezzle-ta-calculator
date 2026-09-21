# AGENTS.md — sezzle-ta-calculator

This repository is a calculator application built as a technical assessment.
It is split into two independently deployable modules, each with its own
`agents.md` describing module-specific conventions:

- [`sezzle-ta-calculator-fe/agents.md`](./sezzle-ta-calculator-fe/agents.md) —
  the frontend, a TypeScript/React SPA built with Vite.
- [`sezzle-ta-calculator-be/agents.md`](./sezzle-ta-calculator-be/agents.md) —
  the backend, a Go HTTP API built with chi.

Read this file first, then read the `agents.md` for whichever module you are
working in. Module-level rules take precedence for that module, but never
override the contract rule below.

## The contract comes first: [`CONTRACT.md`](./CONTRACT.md)

[`CONTRACT.md`](./CONTRACT.md) is the single source of truth for the HTTP API
shape (endpoints, request/response payloads, error format) and for the
functional scenarios the calculator must cover (happy paths, edge cases,
validation failures). It is written in terms of user stories and the
scenarios that verify them.

**Before writing or changing any code in either module, confirm that
`CONTRACT.md` is up to date with what you are about to implement.** If a
story or scenario is missing, ambiguous, or no longer matches the intended
behavior, update `CONTRACT.md` first — as its own change — and only then
implement against it. Code should never define behavior that the contract
doesn't already describe.

## Repository layout

```
.
├── AGENTS.md                    # this file
├── CONTRACT.md                  # API contract + test scenarios (read first)
├── sezzle-ta-calculator-fe/     # frontend module (see its agents.md)
└── sezzle-ta-calculator-be/     # backend module (see its agents.md)
```

Each module is self-contained: its own dependency manifest, its own
Dockerfile, and its own `agents.md`. Cross-module changes (e.g. an API shape
change) must update `CONTRACT.md` and both modules' implementations together.
