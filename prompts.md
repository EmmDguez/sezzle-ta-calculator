# PROMPTS
---
What are the latest long term support versions for go and node?
---
Start a new project. I have cloned a new repository from git@github.com:EmmDguez/sezzle-ta-calculator.git, it is currently empty.
The repository will be structured like so:

git@github.com:EmmDguez/sezzle-ta-calculator.git

A folder called "sezzle-ta-calculator-fe"  

  - An agents.md file specific to the FE module.
  - the FE repo should contain a basic Typescript project structure we are using node 24.
  - the agents.md file shall reference a copy of https://google.github.io/styleguide/tsguide.html as an styling guide and reference the existence of the root agents.md file.
  - The folder should be initialized with vite@latest react-ts, the app should be named  "sezzle-ta-calculator-fe".
  - Add dependencies to tailwind and shadcn/ui for the stylings of the application.
  - A dockerfile should be created to start the project with "node:24-alpine AS build" version as a builder image and a runtime "FROM nginx:1.27-alpine AS runtime".
  - A Folder called "sezzle-ta-calculator-be"
     - An agents.md file specific to the BE module.
     - The agents.md file shall reference a copy of https://google.github.io/styleguide/go/ as an styling guide and reference the existence of the root agents.md file.
     - The folder should be initialized with the basic go folder distribution, chi router and go-playground/validator. It is going to be named "sezzle-ta-calculator-be" we are using "go version go1.26.0 linux/amd64".
     - A dockerfile should be created to test the application use "FROM golang:1.26-alpine AS build" and "FROM gcr.io/distroless/static-debian12:latest AS runtime".
- An agents.md file describing a calculator FE/BE project with modules containing their own agents.md files.
- note in the three agents.md file that a CONTRACT.md file has been created at root where api and scenarios for testing will be defined, both the fe/be module will reference it once stories are written for how the api should work and scenarios that need to be covered, any change needs to validate that this file is up to date to what we are implementing before touching any code.

---
Include a README.md file for each module, with required tools, versions, and instructions to run the project, validate the services are running dont commit anything yet.
---
I have updated the FE port to be 4080 and the BE to be 8090, added a contacts.md and epics.md file, validate the changes and check readme.md files are still ok, commit as initial commit.
---
/bmad-method:bmad-sprint-planning
---
planning-mode -> /bmad-method:bmad-build story 1.1
---
unify 8090 as the sole port when running through docker and locally so that all examples in readme pass for both scenarios and add validation so that sqrt returns unsupported operation whenre the value of right is present as we only use left, remember to update first contract
---
/code-review

follow-up: yes, fix the priority bugs and include the scenarios to keep testing them on contracts.md
---
"    "substract": Subtract, // NB: "substract" is CONTRACT.md's spelling, not a typo to fix. " is a valid typo, fix it in contract and then on code, also check for other typos of subtract
---
 I've manually tested , commit changes and mark story done
---
/bmad-build story 1.2 use contents of planning folder any new files needed to track desicions/stories should be created on the same
  folder/added as modifications to epics.md (keep all changes in fe module, respect contract.md though this should be a design only issue)
---
I have reviewed, commit.
---
/compact
---
/bmad-build story 1.3 use contents of planning folder any new files needed to track desicions/stories should be created on the same folder/added as modifications to epics.md, keep ports consistent for the FE as we did for BE.
---
/bmad-method:bmad-build story 1.4 use contents of planning folder any new files needed to track desicions/stories should be created on the same folder/added as modifications to epics.md, this is planning assume 1.3 will be done before implementing.

follow up: required new story for cors
---
Was wrong to request the change from subtract to substract, apply the correct spelling everywhere starting by contract.md
---
/compact
---
/bmad-build  story 1.3.1 use contents of planning folder any new files needed to track desicions/stories should be created on the same folder/added as modifications to epics.mdee