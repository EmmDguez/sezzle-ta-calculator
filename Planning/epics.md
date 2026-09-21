
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
- Follow-up: `substract` was a genuine typo, not an intentional spelling (an earlier note here incorrectly assumed the latter) — corrected to `subtract` everywhere: contract.md's operation enum and test scenario table, the `internal/calculator` map key, and the operation buttons list in Story 1.2 below. (This was briefly reverted to `substract` and then confirmed back to `subtract` as final — `subtract` is correct English and is the settled spelling; do not change it again.)
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
	* The operation buttons are add, subtract, multiply, divide, power, sqrt.
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
  subtract, multiply, divide, power, sqrt — for Story 1.4 forward-compatibility).
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

### Story 1.3.1: BE: Enable CORS for the FE origin

As an engineer I need the BE to accept cross-origin requests from the FE
so Story 1.4 can call `POST /api/v1/calculate` (and the health endpoints)
directly from the browser without a reverse proxy.

Context: flagged as a follow-up under Story 1.3 above — the FE and BE run
on different origins (`http://localhost:4080` vs `http://localhost:8090`
locally, and the same ports via docker-compose), and the BE currently has
no CORS middleware (grepped in Story 1.3, zero matches).

A/C:
- `CONTRACT.md` is updated first (contract-first rule) to document the
  CORS requirement — allowed origin(s), methods, headers — before
  implementing it in the BE.
- The BE sends CORS headers (`Access-Control-Allow-Origin` and preflight
  `OPTIONS` handling for `Content-Type`, `POST`) on `/api/v1/calculate`,
  and on `/livez`, `/readyz`, `/health`.
- The allowed origin covers `http://localhost:4080` (both local
  `npm run dev`/`preview` and the docker-compose `ui` service, which per
  Story 1.3 both consistently use port 4080).
- `go test ./...` covers the new middleware (e.g. an `internal/server`
  test asserting the header is present and `OPTIONS` preflight succeeds).
- Must be completed before Story 1.4, which assumes the FE can call the BE
  directly, cross-origin, without any additional plumbing (no reverse
  proxy is planned in Story 1.4).

**Status: done.** Implementation notes:
- `CONTRACT.md` gained a new "2.1 CORS" section (added first, per the
  contract-first rule) documenting the allowed origin
  (`http://localhost:4080`, overridable via `CORS_ALLOWED_ORIGIN`), allowed
  methods (`GET`, `POST`, `OPTIONS`), allowed header (`Content-Type`), and
  that preflight `OPTIONS` requests are answered directly.
- Added the [go-chi/cors](https://github.com/go-chi/cors) middleware
  (`internal/server/server.go`), wired globally via `r.Use(cors.Handler(...))`
  so it covers every route (`/api/v1/calculate`, `/livez`, `/readyz`,
  `/health`) with one declaration rather than repeating it per-route. The
  allowed origin reads from `CORS_ALLOWED_ORIGIN`, defaulting to
  `http://localhost:4080` (the FE's port everywhere per Story 1.3) — same
  env-var-with-default pattern already used for `PORT` in `main.go`.
  `docker-compose.yml`'s `api` service now sets `CORS_ALLOWED_ORIGIN`
  explicitly too, for the same reason `PORT` is set explicitly there even
  though it matches the default.
- `internal/server/server_test.go` gained `TestCORS`: asserts
  `Access-Control-Allow-Origin` is present on a normal request to all four
  routes, that an `OPTIONS` preflight (with `Access-Control-Request-Method`/
  `-Headers`) gets a 2xx with the right headers, and that a disallowed
  origin gets no CORS header at all (browsers enforce CORS client-side, so
  the BE deliberately doesn't need to reject the request itself — omitting
  the header is sufficient).
- Verified against the real Docker image, not just the Go test suite:
  rebuilt and ran the `api` service via `docker compose up -d --build api`,
  then `curl`'d it directly with an `Origin: http://localhost:4080` header
  (both a plain `GET /livez` and an `OPTIONS` preflight against
  `/api/v1/calculate`) and confirmed the headers match CONTRACT.md, and that
  `Origin: http://evil.example.com` gets no `Access-Control-Allow-Origin`
  header back.
- `go build ./...`, `go vet ./...`, and `go test ./...` all pass cleanly.

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

**Status: done.** Implementation notes:
- Two ambiguities in this story's own wording were resolved with the user
  before implementation: (1) "the values sent to the BE are visible there
  (right + operation + left)" is implemented as conventional
  `left operation right` order (e.g. `10 + 5`), treating the literal order
  as a wording slip; (2) sqrt "only requires a right value" is implemented
  as always short-circuiting — clicking √ computes on whatever is
  currently in display-main and discards/cancels any pending
  left/operation, regardless of whether a binary operation was in
  progress (confirmed live: `16 + 4` then `√` shows `2`, and a further
  `+ 3 =` correctly starts from `2`, not from the abandoned `16`).
- Despite this story calling sqrt's operand a "right" value (by analogy
  with the binary-op state naming), the actual wire payload sent to the BE
  for sqrt uses CONTRACT.md's `left` field with `right` omitted entirely —
  the internal state-naming convention here and CONTRACT's wire field name
  intentionally don't match, and CONTRACT wins for anything on the network.
- `calculator-shell.tsx` state: `displayValue` (the in-progress operand —
  left or right, per the story text, is whichever CONTRACT.md field it
  becomes once committed), `expression`, `left`, `operation`, `isTemporal`,
  a `status: "ok" | "error" | "unavailable"` tri-state (replacing Story
  1.2's boolean `isError`), and a minimal `isLoading` guard that disables
  the keypad and ignores stale responses while a request is in flight (a
  `requestSeqRef` counter bumped on every new call and on `AC`, so a late
  response after a reset is discarded rather than resurrecting old state).
- A BE-rejected calculation (parseable `{error, message}` body) shows
  `"ERR"` and persists until `AC`/`C`/new digit entry. **Superseded by the
  amendment below**: the first version of this story preserved
  `left`/`operation` for a "correct and retry" flow; the user later asked
  for a full `AC`-style reset instead — see "Amendment" notes. A network
  failure shows `"UNAVAILABLE"` per this story's explicit A/C (verified by
  killing the BE process mid-session and confirming the display, then
  restarting it and confirming `AC` recovers cleanly) — rendered at a
  smaller font size than digits/ERR so the longer word doesn't truncate.
- New `src/lib/calculator-api.ts` wraps `fetch` and maps responses to
  `{ok:true, result}` / `{ok:false, kind:"rejected", error, message}` /
  `{ok:false, kind:"unavailable"}`; `right` is omitted from the request
  body entirely (not sent as `undefined`/`null`) for sqrt. Targets
  `${protocol}//${hostname}:8090` by default — the BE's port on the page's
  own host, matching both local dev and docker-compose — overridable via
  a `VITE_API_BASE_URL` build-time env var.
- Depended on Story 1.3.1 (BE CORS), confirmed already implemented before
  this story began: the FE calls the BE's absolute origin directly with no
  reverse proxy in either `vite.config.ts` or `nginx.conf`.
- `display-main.tsx`'s prop changed from `isError: boolean` to `status`;
  `keypad.tsx` now takes the real `operation` state (renamed from Story
  1.2's cosmetic `activeOperation` toggle) plus a `disabled` prop threaded
  through `input-button.tsx`/`action-button.tsx` to the shadcn `Button`.
- `sezzle-ta-calculator-fe/README.md` gained a "Using the calculator"
  section (keyboard/click usage, the BE dependency, `ERR`/`UNAVAILABLE`
  meaning, and the `VITE_API_BASE_URL` override) per this story's A/C.
- Verified via `npm run lint`, `npm run build`, and a live browser session
  against the real Go BE (not mocked): every CONTRACT.md scenario category
  exercised through the UI — happy-path add/divide, decimal rounding
  (`1 ÷ 3 = 0.3333`), `division_by_zero`, operation chaining without
  pressing `=` in between, the sqrt short-circuit above, and the
  `UNAVAILABLE` path. No test framework was added — still gated on
  `agents.md`'s "first CONTRACT.md-driven test" rule, which this story
  satisfies the precondition for but doesn't itself trigger, since
  verification here was manual/live rather than an automated FE test.

**Amendment (errors reset like AC; negative number entry).** After the
above was verified, a live `/code-review` plus follow-up user feedback
prompted two behavior changes, both confined to `calculator-shell.tsx` and
`number-input.ts`:
- Both a BE-rejected calculation and the client-side
  `Number.MAX_SAFE_INTEGER` overflow guard now reset `left`/`operation`/
  `isTemporal`/`displayValue`/`expression` immediately, as if `AC` had been
  pressed, rather than preserving them for a "correct and retry" flow.
  `"ERR"` still persists until the user acts for a BE rejection; the
  overflow guard keeps its existing ~900ms auto-revert, now revealing a
  cleared `"0"` instead of the pre-overflow number when it expires. A
  network failure (`"unavailable"`) is deliberately **not** included in
  this reset — the BE never actually rejected anything, so
  `left`/`operation`/`displayValue` stay intact for a plain retry via `=`.
- Any pending overflow auto-revert timer is now cancelled
  (`clearErrorTimeout()`) whenever a real BE response arrives, closing a
  race where a stale timer could silently flip a genuine BE error back to
  `"ok"` ~900ms later.
- Negative number entry: the `−` key/button (keyboard `-` and the keypad
  button both funnel through the same `subtract` action) is now
  contextual — pressed while the current entry is blank (regardless of
  whether an operation is already pending), it inserts a leading minus
  sign via `handleDigit("-")` instead of triggering `subtract`; once a
  digit exists, it behaves exactly as `subtract` did before. Trade-off
  accepted by the user: there's no longer a blank-entry gesture to swap a
  *pending* operation specifically to `subtract` (add/multiply/divide/power
  can still be swapped while blank) — pressing `−` there always starts a
  negative number now. `number-input.ts` gained a new `isBlankOperand()`
  guard (`""` or a lone `"-"`) used everywhere `displayValue` was checked
  for "nothing to operate on," so a lone `-` can never reach `Number()`/the
  BE as `NaN`. Verified live: `-1 × -10 = 10` with the expression trail
  reading `-1 × -10`.
- Three bugs the `/code-review` agent found in this same code were fixed
  alongside the above (all reproduced and re-verified live):
  (1) chaining to a *different* operator while `status === "unavailable"`
  was resubmitting the stale old operation instead of the new one — fixed
  by extending the "swap the operation, don't compute" branch to also
  cover `status === "unavailable"`, resetting `status` back to `"ok"` so
  the preserved right-hand entry reappears for the corrected operator;
  (2) clicking an operator directly after `=` (no digit typed) left a
  stale `expression`/`isTemporal` trail on screen — fixed by resetting
  both when committing a fresh `left`; (3) the same stale-trail issue on
  plain `C` right after a result — fixed the same way, gated on
  `isTemporal`. The `/code-review` run's other findings (a BE CORS
  same-origin edge case on non-`localhost` hosts, a BE `power`
  Inf-vs-`invalid_operation` gap for `0^-1`, and two architecture
  suggestions about `calculator-shell`'s state shape and the keyboard
  hook's effect dependencies) were **not** acted on — they're BE-module or
  pure-refactor items outside this amendment's scope.
- Verified via `npm run lint`, `npm run build`, and a live browser session
  against the real BE for every change above (a stale `docker compose`
  container from earlier CORS testing was found squatting on ports
  4080/8090 mid-verification, serving a pre-amendment build — stopped so
  the real local dev/BE servers could be tested instead).

## Testing infrastructure (FE unit tests + coverage, both modules' READMEs)

The FE `agents.md` had a standing rule: "there is no test runner configured
yet — add one ... when the first CONTRACT.md-driven test is written." Story
1.4's amendment above (the API client, the digit/negative-number rules)
was exactly that trigger, so this adds it rather than leaving it deferred
further:
- Added Vitest + `@vitest/coverage-v8` + `jsdom` to the FE (`vite.config.ts`
  gained a `test` block; `package.json` gained `test`/`test:watch`/
  `coverage` scripts). `src/lib/number-input.test.ts` and
  `src/lib/calculator-api.test.ts` cover the digit/negative-number entry
  rules and the BE API client's request shape and response mapping
  (success, every `CalculateResult` failure kind, and CONTRACT.md's
  sqrt-omits-`right` rule), all driven directly by CONTRACT.md rather than
  component behavior.
- Coverage is intentionally scoped to `src/lib/**/*.ts` (97.4% statements /
  95.7% branches / 100% functions) rather than the whole `src/` tree —
  component/UI code is still verified by hand in a real browser (as
  documented throughout this file's implementation notes), not by
  automated tests, so including it in the coverage percentage would make
  the number meaningless rather than informative.
- The one uncovered branch in `number-input.ts` (`exceedsMaxSafeInteger`'s
  early-return for an empty/incomplete candidate) is dead code from
  `appendDigit`'s only call site — every real caller already guarantees a
  candidate with at least one digit — left as defensive code rather than
  removed, since this was a testing pass, not a refactor.
- The BE already had a full `go test` suite (Stories 1.1/1.3.1); this pass
  only added `-coverpkg=./...` to its documented coverage command in
  `sezzle-ta-calculator-be/README.md`, since plain `go test ./... -cover`
  hides that `internal/validate` is actually exercised indirectly through
  `internal/handler`'s tests (0% own-package coverage vs. its real
  85.7%/100% function coverage under `-coverpkg=./...`).
- Both module READMEs and `agents.md` files, plus the root `README.md`,
  gained a coverage section/table with the commands to reproduce the
  numbers — explicitly framed as a point-in-time snapshot to re-run, not a
  maintained badge, since neither module has CI configured to keep one
  fresh.
- Verified: `npm run test` (30 tests, all passing) and `npm run coverage`
  in the FE; `go test ./... -coverpkg=./...` and `go tool cover -func` in
  the BE; `npm run lint` and `npm run build` still clean.