# CONTRACT.md — API & Scenario Contract

This document is the source of truth for the calculator API and for the
scenarios both the frontend and backend must satisfy. Both
[`sezzle-ta-calculator-fe/agents.md`](./sezzle-ta-calculator-fe/agents.md)
and [`sezzle-ta-calculator-be/agents.md`](./sezzle-ta-calculator-be/agents.md)
reference this file.

**Rule:** before touching any implementation code in either module, verify
this file already describes the behavior you're about to build or change. If
it doesn't, update this file first, as its own change, then implement against
it. This file should never lag behind the implementation, and the
implementation should never lead ahead of this file.

Status: no user stories have been written yet. The sections below are the
template to fill in once stories exist — do not treat their absence as
license to invent API behavior ad hoc in code.

## 1. User stories

Stories are defined on the Planning folder.

## 2. Calculator API contract

### POST /api/v1/calculate

#### Request
Formatted as JSON, with the fields:
- operation(string, required) - [add, subtract, multiply, divide, power, sqrt]
- left(number, required) - number 
- right(number, conditional) - number; required for every operation except sqrt. For sqrt, right must be omitted entirely — including it is rejected as `unsupported_operation`.
Sample:
``` JSON
{"left": 200, "operation": "add", "right":10}
```

#### Responses
Reponse can be a result for the operation or an error message.
```JSON
  {"result": 210}
```

```JSON
{"error": "division_by_zero", "message": "cannot divide by zero"}
```

#### Error codes

400 - invalid_json - body isn't valid JSON
400 - missing_field - missing required field
400 - unsupported_operation - operation is not supported
400 - wrong_type - field [<field-name>] is not of expected type
422 - division_by_zero - cannot divide by zero
422 - negative_sqrt - cannot calculate negative sqrt
422 - overflow - number exceeds MAX_SAFE_INTEGER.
422 - invalid_operation - the operation is mathematically undefined for the given operands

### GET /livez
Simple check for application availability
```JSON
{ "status": "ok" }
```

### GET /readyz
Simple check for application readiness
```JSON
{ "status": "ok" }
```
### GET /health
Simple check for backwards compatibility.
```JSON
{ "status": "ok" }
```


## 3. Test scenarios
operation | left | right | result\error
add | 2 | 3 | 5
add | 9007199254740991 | 1 | 422 overflow
subtract | 300 | 100 | 200
subtract | | | 400 missing_field
multiply | 100 | 200 | 20000 
multiply | -100 | 200 | -20000 
multiply | 9007199254740991 | 2| 422 overflow
divide | 100 | 33 | 3.0303
divide | 30 | 0 | 422 division_by_zero
sqrt | -1 | | 422 negative_sqrt
sqrt | 25 | | 5
percentage | 10 | 10 | 400 unsupported_operation
power | 2 | 54 | 422 overflow
power | 5 | 4 | 625
add | 2.5 | 3.25 | 5.75
subtract | 10.75 | 4.5 | 6.25
multiply | 0.1 | 0.2 | 0.02
divide | 1 | 3 | 0.3333
power | 2 | 0.5 | 1.4142
sqrt | 2 | | 1.4142
sqrt | 25 | 5 | 400 unsupported_operation
add | 9007199254740990 | 1 | 9007199254740991
power | -8 | 0.5 | 422 invalid_operation
