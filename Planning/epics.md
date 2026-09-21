
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

### Story 1.3: create a docker compose file to connect both modules

As an engineer I need FE/BE to be able to communicate.
A/C:
- A docker-compose.yml file is created at root in sezzle-ta-calculator that can be executed to connect both halves,
API will live  on 8090 port and UI on 4080 port.
- the Root readme.md is updated with information.

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