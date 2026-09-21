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