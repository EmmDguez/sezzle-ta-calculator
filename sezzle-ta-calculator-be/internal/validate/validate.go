// Package validate exposes a shared go-playground/validator instance so
// request payloads can be validated consistently across handlers.
package validate

import "github.com/go-playground/validator/v10"

var instance = validator.New(validator.WithRequiredStructEnabled())

// Struct validates s against its `validate` struct tags.
func Struct(s any) error {
	return instance.Struct(s)
}
