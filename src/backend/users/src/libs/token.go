package libs

import (
    "github.com/satori/go.uuid"
)


func NewToken() (string) {
    return uuid.Must(uuid.NewV4()).String()
}
