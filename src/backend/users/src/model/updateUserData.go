package model

type UpdateUserData struct {
    Type string                 `json:"type"`
    Active bool                 `json:"active"`
    FirstName string            `json:"first_name"`
    LastName string             `json:"last_name"`
    Email string                `json:"email"`
}
