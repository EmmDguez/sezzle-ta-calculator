
## Epic 1: Backend GO Microservice
Covers the backend of the technical assessment calculator.
### Story 1.1: BE: Operations endpoint

As an engineer I need an endpoint that can be used to provide functionality for the calculator logic methods.

Implement a method called POST /api/v1/calculate as described on contract.md
As part of the implementation of the endpoints add the livez and readyz enfpoints described on the contracts.md docs
A/C:
- The endpoint is available on the specified path
- It accepts the json as described and validates the input in accordance with the test scenarios
- invalid jsons are rejected accurately 
- operations are discarded once the overflow threshold of typescript's Number.MAX_SAFE_INTEGER(9,007,199,254,740,991) is surpassed.
- decimal results are rounded to the 4th decimal point.
- every operation lives under it's own method and all operations validate for the MAX_SAFE_INTEGER threshold.
- add decimal scenarios to the test scenarios table on contract.md  and on implementation. 
- the readme.md on the module directory is updated.

**Status: done.** Implementation notes:
- `/healthz` was replaced with `/livez`, `/readyz`, and `/health` per contract.md's endpoints (the old placeholder healthz route predated contract.md).
- ~~`power`'s domain errors (e.g. a negative base with a fractional exponent, which produces `NaN`) are mapped to the `overflow` error code as a documented gap~~ — fixed via a `/code-review` finding: `power`'s `NaN` case now gets its own `422 invalid_operation` error code, added to contract.md alongside a `power | -8 | 0.5 | 422 invalid_operation` test scenario.
- Tests: `internal/calculator/calculator_test.go` and `internal/handler/calculate_test.go` cover every row in contract.md's test scenario table (including the new decimal rows) plus edge cases (non-object JSON body, explicit-zero inputs, overflow-vs-domain-error precedence); `internal/server/server_test.go` proves the routes are actually wired.
- Follow-up after this story was marked done: `sqrt` now rejects a present `right` operand (any value, including `0`) as `unsupported_operation`, since `sqrt` only uses `left`. contract.md's request description and test scenario table were updated accordingly.
- Follow-up: `substract` was a genuine typo, not an intentional spelling (an earlier note here incorrectly assumed the latter) — corrected to `subtract` everywhere: contract.md's operation enum and test scenario table, the `internal/calculator` map key, and the operation buttons list in Story 1.2 below.
- Reversal of the above: `substract` is the intended spelling after all (per direct instruction) — reverted `subtract` back to `substract` everywhere it had been changed: contract.md's operation enum and test scenario table, the `internal/calculator` map key (the exported Go function name stays correctly spelled `Subtract`; only the API/map-key string reverted), `calculator_test.go`'s scenario table, and the FE's `Operation` type, `button-config.ts`, and `keypad.tsx` (the FE's `ariaLabel: "Subtract"` display text also stays correctly spelled — only the operation identifier reverted).
- Follow-up via `/code-review`: `round4` silently corrupted results above ~9×10^11 (well inside MAX_SAFE_INTEGER) because multiplying by 10000 before rounding exceeded float64's exact 2^53 integer range — e.g. `Add(9007199254740990, 1)` returned `9007199254740990` instead of `9007199254740991`. Fixed by leaving values above a `roundSafeLimit` threshold unchanged; contract.md gained a regression scenario (`add | 9007199254740990 | 1 | 9007199254740991`).

### Story 1.2: FE: Design draft + static components
As a user I need a UI to interact with the calculator system that will allow input of operations an seeing results.

Using superdesign tool, define a layout for the calculator that will be comprised of:
- calculator-shell
  Holds the body of the calculator and the state.
- display-main
  shows the current input (numbers, minus sign, and period only) just valid numbers or blank, it can be edited by input-button or keyboard but only accepts valid input. if a number string starts with leading zeroes those should be removed.
  It can also output ERR but this value is always temporal.
- display-expression component
  if the current value on the display-main is the result of a previous operation it will show it or blank on an smaller font above the display-main text.
- input-button (numberpad + .)
  triggers the addition of the number in the display-main component, it is also used by the period button.
- action-button
  will trigger an action depending of the button
	* AC, clears display-main and display-expression, if there is an ongoing operation it is cancelled.
	* C, clears the value of display-main, the current value to be inputed.
	* The operation buttons are add, substract, multiply, divide, power, sqrt.
	* =, equals button  

A/C:
- Starting the image will show a calculator shell with the usual layout numpad & action buttons, under input/display area.
- The buttons have hover actions to transition colors.
- The buttons are clickable.
- The display area accepts numbers, minus sign, and period only in a valid number format.
- Number.MAX_SAFE_INTEGER(9,007,199,254,740,991) is the max allowed input, a tooltip on the display area should contain a warning about this.
- the UX is responsive growing horizontally but kept centered when space is available and being able to be reduced to a mobile friendly format.

**Status: done.** Implementation notes:
- Implemented under `sezzle-ta-calculator-fe/src/components/calculator/`
  (calculator-shell, display-main, display-expression, input-button,
  action-button, keypad) plus `src/lib/number-input.ts` (digit/format
  validation) and `src/types/calculator.ts` (the `Operation`/`ActionKind`
  vocabulary, kept identical to CONTRACT.md's operation strings — add,
  substract, multiply, divide, power, sqrt — for Story 1.4 forward-compatibility).
- calculator-shell owns only local `displayValue`, `expression` (always
  blank in this story), `isError`, and a cosmetic `activeOperation`
  highlight — no `left`/`operation`/`right`/`isTemporal` state machine and
  no network calls; that machine and the POST /api/v1/calculate wiring are
  Story 1.4's responsibility.
- Operation and equals action-buttons are visually wired (hover, click,
  pressed/selected styling) but perform no calculation in this story, by
  design.
- The only trigger for the temporary "ERR" display in this story is a
  client-side Number.MAX_SAFE_INTEGER overflow guard during digit entry
  (no BE-driven error states exist yet); it auto-reverts to the last valid
  value after a short timeout, and is fully cleared by AC/C.
- Design approach: reused the app's existing OKLCH/shadcn tokens rather
  than introducing a new palette — the shell reads as a physical
  instrument (an inset "LCD" display panel, tabular numerals that don't
  jitter while typing) rather than a generic card-grid layout, with a
  single bold accent reserved for the equals key.
- Added shadcn `tooltip` (`npx shadcn@latest add tooltip`) for the
  MAX_SAFE_INTEGER warning on display-main; all other calculator UI is
  composed from the existing `Button` primitive — no other new shadcn
  components were needed.
- Verified via `npm run lint`, `npm run build`, and a manual browser check
  (hover states, click + keyboard entry, leading-zero stripping, overflow
  ERR + auto-revert, responsive breakpoints down to ~390px, tooltip). No
  automated test framework was added, per agents.md guidance to add one
  only when the first CONTRACT.md-driven test is written (Story 1.4).

### Story 1.3: create a docker compose file to connect both modules

As an engineer I need FE/BE to be able to communicate.
A/C:
- A docker-compose.yml file is created at root in sezzle-ta-calculator that can be executed to connect both halves,
API will live  on 8090 port and UI on 4080 port.
- the Root readme.md is updated with information.

**Status: done.** Implementation notes:
- Added `docker-compose.yml` at the repo root with two services: `api`
  (builds `sezzle-ta-calculator-be`, published on host port 8090, with
  `PORT=8090` set explicitly even though it's already the BE's default) and
  `ui` (builds `sezzle-ta-calculator-fe`, published on host port 4080,
  `depends_on: api`). No custom network is declared — compose's default
  network already gives the containers service-name DNS resolution
  (`http://api:8090`) for when Story 1.4 wires real FE→BE calls. No
  `healthcheck:` was added: the BE runtime image is
  `gcr.io/distroless/static-debian12`, which has no shell/curl/wget to run a
  check with.
- FE port consistency fix (requested alongside this story): the FE
  previously used three different ports depending on how it ran —
  `npm run dev` defaulted to Vite's 5173, `npm run preview` to 4173, and the
  Docker image listened on 8080 internally while being documented as
  remapped to host 4080. `vite.config.ts` now sets `server.port` and
  `preview.port` to `4080` with `strictPort: true` (fails loudly on a
  conflict instead of silently picking another port), and `nginx.conf`
  (`listen`) plus the FE `Dockerfile` (`EXPOSE`) were changed from 8080 to
  4080 so the container's own listen port matches too — dev, preview, and
  the Docker image now all use the same 4080, and `docker-compose.yml` maps
  it `4080:4080` with no remapping. Updated every `docker run`/port example
  and prose mention in `sezzle-ta-calculator-fe/README.md` and
  `sezzle-ta-calculator-fe/agents.md` to match.
- Root `README.md` (previously a 2-line stub) now documents the
  `docker compose up --build` quickstart, the resulting URLs, and links out
  to `CONTRACT.md` and each module's own README for standalone dev. Root
  `agents.md`'s repository layout tree now lists `docker-compose.yml` and
  `README.md`.
- Follow-up flagged for Story 1.4: the BE has no CORS middleware anywhere
  (grepped, zero matches). This isn't required for this story — the FE
  doesn't call the BE yet (Story 1.2, done today, is static-only) — but once
  Story 1.4 wires the FE to actually call the BE across origins
  (`localhost:4080` → `localhost:8090`), CORS headers will be needed on the
  BE for browser fetches to succeed.

### Story 1.4: FE: State wiring to the real API.
As a user I required the actions in the calculator to generate results that are correct and valid.

Implement the state wiring in the components and logic to call the BE endpoint defined on CONTRACT.md

- The calculator-shell will contain state for: 
  - left, left value of operation.
  - operation, current operation if an action-button matching an operation has been clicked.
  - right, right side of the operation to be executed.
  - isTemporal, this value is used when a result is returned to the current display/left value is replaced when true, it should default to false, and be reset accordingly when AC is clicked.
- The display-main will contain state for the current value being edited, left or right depending on if an operation is in progress.
-  the display_expression, if the current value on the display-main is the result of a previous operation it will show it, and it will be cleared once isTemporal toggles, clearing it until a new left + operation values are set.
- when an action-button is clicked it will depend on the button:
  - AC, clears display-main and display-expression, if there is an ongoing operation it is cancelled.
  - C, clears the value of display-main, the current value to be inputed.
  - The operation buttons share:
		- when display-main has any number and no operation is ongoing they operate on it, this should add the operation to the state as ongoing f.e. "left", should be display_main value, "operation" should be the selected one and the display-main value updated to empty.
		- if there is an ongoing operation the current value of display_main has to be used as "right", the result of the operation processed in the be, and the result replaces the display-main value, the isTemporal flag indicating this value is replaceable should be turned on, and the value should replace "left", the "right" should be cleared, in order to receive a new operation. This process should update display-expression component so that the values sent to the BE are visible there (right + operation + left)
		- if there is an ongoing operation and input is blank or isTemporal is true the "operation" should replace the ongoing operation without performing any other action.
		- The exception to this is sqrt which only requires a "right" value once it is clicked the operation should be sent to the be.
  - equals, should send the right, operation, left values to the be for processing if clicked when no operation is ongoing it should be ignored.
  
A/C:
  - the test scenarios behave as expected.
  - the readme.md on the module directory is updated with usage instructions.
  - If the backend returns an unexpected connection issue, UNAVAILABLE should be set on the display.