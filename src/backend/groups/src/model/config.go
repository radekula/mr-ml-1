package model

type ConfigService struct {
    Port int                     `json:"port"`
    Database string              `json:"database"`
}

type ConfigRemotes struct {
    Users string                 `json:"users"`
}

type Config struct {
    Service ConfigService        `json:"service"`
    Remotes ConfigRemotes        `json:"remotes"`
}
