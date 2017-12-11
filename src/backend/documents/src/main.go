package main

import (
    "fmt"
    "strconv"
    "net/http"
    "./config"
    "./controller"
)

func main() {
    conf := config.GetConfig()

    http.HandleFunc("/", controller.About)
    http.HandleFunc("/document/", controller.Document)
    http.HandleFunc("/documents/", controller.Documents)
    http.HandleFunc("/user/", controller.UserDocuments)

    fmt.Println("Running server on port: " + strconv.Itoa(conf.Service.Port))
    http.ListenAndServe(":" + strconv.Itoa(conf.Service.Port), nil)
}
