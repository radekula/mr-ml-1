package libs

import (
    "github.com/satori/go.uuid"
)


func NewToken() (string) {
    return uuid.NewV4().String()
}
