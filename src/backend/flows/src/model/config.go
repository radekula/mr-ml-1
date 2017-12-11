package model

type ConfigService struct {
    Port int                     `json:"port"`
}

type ConfigDatabase struct {
    Host string                  `json:"host"`
    Name string                  `json:"name"`
    Collection string            `json:"collection"`
    CollectionSteps string       `json:"collection_steps"`
}

type ConfigRemotes struct {
    Users string                 `json:"users"`
    Groups string                `json:"groups"`
}

type Config struct {
    Service ConfigService        `json:"service"`
    Database ConfigDatabase      `json:"database"`
    Remotes ConfigRemotes        `json:"remotes"`
}
