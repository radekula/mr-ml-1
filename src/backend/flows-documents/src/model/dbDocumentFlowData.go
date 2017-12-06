package model

type DBHistoryAction struct {
    Login string                 `bson:"login"`
    Action string                `bson:"action"`
    Date string                  `bson:"date"`
}


type DBHistoryData struct {
    Step string                  `bson:"step"`
    Actions []DBHistoryAction    `bson:"actions"`
}


type DBStatusData struct {
    Document string              `bson:"document"`
    Flow string                  `bson:"flow"`
    CurrentStep string           `bson:"current_step"`
    History []DBHistoryData      `bson:"history"`
}

