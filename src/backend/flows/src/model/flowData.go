package model

type FlowData struct {
    Id string               `json:"id"`
    Name string             `json:"name"`
    Active bool             `json:"active"`
    Owner string            `json:"owner"`
    CreateDate string       `json:"create_date"`
    Description string      `json:"description"`
}

type FlowId struct {
    Id string               `json:"id"`
}
