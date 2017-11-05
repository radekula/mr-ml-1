package model

type DBMemberData struct {
    Name string                 `bson:"name"`
}


type DBGroupData struct {
    Name string                 `bson:"name"`
    Active bool                 `bson:"active"`
    CreateDate string           `bson:"create_date"`
    Creator string              `bson:"creator"`
    Description string          `bson:"description"`
    Members []DBMemberData     `bson:"members"`
}
