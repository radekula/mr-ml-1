package main

import (
    "fmt"
    "net/http"
    "./controller"
    "./config"
    "strconv"
)


func main() {
    conf := config.GetConfig()

    http.HandleFunc("/", controller.About)
    http.HandleFunc("/documents/", controller.Documents)
    http.HandleFunc("/actions/", controller.Actions)
    http.HandleFunc("/comments/", controller.Comments)

    fmt.Println("Running server on port: " + strconv.Itoa(conf.Service.Port))
    http.ListenAndServe(":" + strconv.Itoa(conf.Service.Port), nil)
}
