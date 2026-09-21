FROM golang:1.26-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" \
    -o /out/sezzle-ta-calculator-be ./cmd/sezzle-ta-calculator-be

FROM gcr.io/distroless/static-debian12:latest AS runtime

COPY --from=build /out/sezzle-ta-calculator-be /sezzle-ta-calculator-be

USER nonroot:nonroot
EXPOSE 8080

ENTRYPOINT ["/sezzle-ta-calculator-be"]
