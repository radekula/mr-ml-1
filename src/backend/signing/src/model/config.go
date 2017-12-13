package model

type ConfigService struct {
    Port int                     `json:"port"`
}

type ConfigDatabase struct {
    Host string                  `json:"host"`
    Name string                  `json:"name"`
    Collection string            `json:"collection"`
    CollectionKeys string        `json:"collection_keys"`
}

type ConfigRemotes struct {
    Users string                 `json:"users"`
    Documents string             `json:"documents"`
}

type Config struct {
    Service ConfigService        `json:"service"`
    Database ConfigDatabase      `json:"database"`
    Remotes ConfigRemotes        `json:"remotes"`
}
