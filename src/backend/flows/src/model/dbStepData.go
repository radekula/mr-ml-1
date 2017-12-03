package model


type DBStepData struct {
    Id string               `bson:"id"`
    Flow string             `bson:"flow"`
    Type string             `bson:"type"`
    Prev []string           `bson:"prev"`
    Participants []string   `bson:"participants"`
    Description string      `bson:"description"`
}
