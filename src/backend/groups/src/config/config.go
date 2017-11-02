package config

import (
    "fmt"
    "../model"
)


func GetConfig() {    
    raw, err := ioutil.ReadFile("/config.json")
    if err != nil {
        fmt.Println(err.Error())
        os.Exit(1)
    }

    var conf model.Config
    json.Unmarshal(raw, &conf)
    
    return conf
}
