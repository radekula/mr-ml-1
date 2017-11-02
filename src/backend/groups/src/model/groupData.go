package model

type GroupData struct {
    Active bool                 `json:"active"`
    CreateDate string           `json:"create_date"`
    Creator string              `json:"creator"`
    Description string          `json:"description"`
}
