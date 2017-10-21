package model

type NewUserData struct {
    Type string                 `json:"type"`
    Active bool                 `json:"active"`
    Login string                `json:"login"`
    FirstName string            `json:"first_name"`
    LastName string             `json:"last_name"`
    Email string                `json:"email"`
    Password string             `json:"password"`
}
