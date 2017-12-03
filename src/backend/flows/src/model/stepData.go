package model

type StepData struct {
    Id string               `json:"id"`
    Type string             `json:"type"`
    Prev []string           `json:"prev"`
    Comment string          `json:"comment"`
    Participants []string   `json:"participants"`
    Description string      `json:"description"`
}

type StepId struct {
    Id string               `json:"id"`
}
