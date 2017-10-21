package model

type DBUserData struct {
    Type string                 `bson:"type"`
    Active bool                 `bson:"active"`
    Login string                `bson:"login"`
    FirstName string            `bson:"firstname"`
    LastName string             `bson:"lastname"`
    Email string                `bson:"email"`
    Password string             `bson:"password"`
    Token string                `bson:"token"`
    ExpirationTime string       `bson:"expirationtime"`
    LastLogin string            `bson:"lastlogin"`
    LastActive string           `bson:"lastactive"`
}
