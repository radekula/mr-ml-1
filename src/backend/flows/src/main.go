package main

import (
    "fmt"
    "net/http"
    "./config"
    "./controller"
    "strconv"
)


func main() {
    conf := config.GetConfig()

    http.HandleFunc("/", controller.About)
    http.HandleFunc("/flows/", controller.Flows)
    http.HandleFunc("/flow/", controller.Flow)

    fmt.Println("Running server on port: " + strconv.Itoa(conf.Service.Port))
    http.ListenAndServe(":" + strconv.Itoa(conf.Service.Port), nil)
}
