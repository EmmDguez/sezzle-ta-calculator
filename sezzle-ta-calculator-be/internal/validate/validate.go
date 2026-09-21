// Package validate exposes a shared go-playground/validator instance so
// request payloads can be validated consistently across handlers.
package validate

import (
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

var instance = newValidator()

func newValidator() *validator.Validate {
	v := validator.New(validator.WithRequiredStructEnabled())
	// Report the JSON tag name (e.g. "left") instead of the Go field name
	// (e.g. "Left") so handlers can build CONTRACT.md-shaped error messages
	// straight from ValidationErrors without guessing at a name mapping.
	v.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name, _, _ := strings.Cut(fld.Tag.Get("json"), ",")
		if name == "-" {
			return ""
		}
		return name
	})
	return v
}

// Struct validates s against its `validate` struct tags.
func Struct(s any) error {
	return instance.Struct(s)
}
