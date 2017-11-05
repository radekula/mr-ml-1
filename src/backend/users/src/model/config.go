package model

type ConfigService struct {
    Port int                     `json:"port"`
}

type ConfigDatabase struct {
    Host string                  `json:"host"`
    Name string                  `json:"name"`
    Collection string            `json:"collection"`
}

type Config struct {
    Service ConfigService        `json:"service"`
    Database ConfigDatabase      `json:"database"`
}
