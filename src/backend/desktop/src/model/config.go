package model

type ConfigService struct {
    Port int                     `json:"port"`
}

type ConfigRemotes struct {
    Users string                 `json:"users"`
    Documents string             `json:"documents"`
    FlowsDocuments string        `json:"flows-documents"`
    Comments string              `json:"comments"`
}

type Config struct {
    Service ConfigService        `json:"service"`
    Remotes ConfigRemotes        `json:"remotes"`
}
