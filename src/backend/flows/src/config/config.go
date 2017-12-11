package config

import (
    "io/ioutil"
    "encoding/json"
    "../model"
    "sync"
)

var instance *model.Config
var once sync.Once

func GetConfig() *model.Config {
    once.Do(func() {
        instance = &model.Config{}

        raw, err := ioutil.ReadFile("/config.json")
        if err != nil {
            panic(err)
        }

        json.Unmarshal(raw, instance)
    })

    return instance
}
