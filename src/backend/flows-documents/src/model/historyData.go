package model

type HistoryAction struct {
    Login string                 `json:"login"`
    Action string                `json:"action"`
    Date string                  `json:"date"`
}


type HistoryData struct {
    Step string                  `json:"step"`
    Actions []HistoryAction      `json:"actions"`
}


type StatusData struct {
    Document string              `json:"document"`
    Flow string                  `json:"flow"`
    CurrentSteps []string        `json:"current_steps"`
    History []HistoryData        `json:"history"`
}

