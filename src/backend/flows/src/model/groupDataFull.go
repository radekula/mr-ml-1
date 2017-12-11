package model

type GroupDataFull struct {
    Name string                 `json:"name"`
    Active bool                 `json:"active"`
    CreateDate string           `json:"create_date"`
    Creator string              `json:"creator"`
    Description string          `json:"description"`
}

