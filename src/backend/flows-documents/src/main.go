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
    http.HandleFunc("/start/", controller.Start)
    http.HandleFunc("/status/", controller.Status)
    http.HandleFunc("/action/", controller.Action)
    http.HandleFunc("/force/", controller.Force)
    http.HandleFunc("/user/", controller.UserActions)

    fmt.Println("Running server on port: " + strconv.Itoa(conf.Service.Port))
    http.ListenAndServe(":" + strconv.Itoa(conf.Service.Port), nil)
}
