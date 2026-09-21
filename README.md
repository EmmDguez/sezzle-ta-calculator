# sezzle-ta-calculator

Repo for technical assessment: a calculator application split into two
independently deployable modules — a Go HTTP API and a TypeScript/React SPA.
See [`agents.md`](./agents.md) for the repository layout and conventions, and
[`CONTRACT.md`](./CONTRACT.md) for the API contract both modules implement
against.

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

## 

* Using claude as an AI tool for development
* Created a contract.MD file to outline the api and behavior for both modules.
* Created an epics.md file to use as an input for the BMAD plugin
  * Keeping on file but would serve for tracking against a real ticketing.system like jira.
  * Ommitted percentage as it adds a layer of complexity over the operands, it would be a next story under this repo.
* Defined the requirements as stories in the epics.md file.
* Using Long Term Support versions for the services
  * FE, is using node 24,tailwimd and shadcn/ui as supporting tools.
  * GO, is using chi and validator 
* 
