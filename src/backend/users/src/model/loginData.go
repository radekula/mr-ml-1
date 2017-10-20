package model

type LoginData struct {
    Password string             `json: "password" bson:"password,omitempty"`
}
