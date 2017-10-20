package model

type UpdateUserData struct {
    Type string                 `json: "type"  bson:"type,omitempty"`
    Active bool                 `json: "active" bson:"active,omitempty"`
    Login string                `json: "login" bson:"login,omitempty"`
    FirstName string            `json: "first_name bson:"first_name,omitempty""`
    LastName string             `json: "last_name" bson:"last_name,omitempty"`
    Email string                `json: "email" bson:"email,omitempty"`
    Password string             `json: "password" bson:"password,omitempty"`
}
