package model

type TokenData struct {
    Token string                   `json: "token" bson:"token,omitempty"`
    ExpirationTime int             `json: "expiration_time" bson:"expiration_time,omitempty"`
}
