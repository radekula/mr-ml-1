package model

type UserData struct {
    Type string                 `json:"type"`
    Active bool                 `json:"active"`
    Login string                `json:"login"`
    FirstName string            `json:"first_name"`
    LastName string             `json:"last_name"`
    Email string                `json:"email"`
    LastLogin string            `json:"last_login"`
    LastActive string           `json:"last_active"`
    TokenExpirationTime string  `json:"token_expiration_time"`
    Token string
}
