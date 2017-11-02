package config

import (
    "io/ioutil"
    "encoding/json"
    "../model"
)


func GetConfig() (model.Config) {
    var conf model.Config

    raw, err := ioutil.ReadFile("/config.json")
    if err != nil {
        return conf
    }

    json.Unmarshal(raw, &conf)
    
    return conf
}
