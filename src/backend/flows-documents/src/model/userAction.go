package model

type UserAction struct {
    Document string               `json:"document"`
    Title string                  `json:"title"`
    Flow string                   `json:"flow"`
    FlowName string               `json:"flow_name"`
    Step string                   `json:"step"`
    Type string                   `json:"type"`
}

