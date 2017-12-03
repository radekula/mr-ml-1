package model


type DBFlowData struct {
    Id string               `bson:"id"`
    Name string             `bson:"name"`
    Active bool             `bson:"active"`
    Owner string            `bson:"owner"`
    CreateDate string       `bson:"create_date"`
    Description string      `bson:"description"`
}

