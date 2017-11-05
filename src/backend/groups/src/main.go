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
    http.HandleFunc("/groups/", controller.Groups)
    http.HandleFunc("/group/", controller.Group)
    http.HandleFunc("/members/", controller.Members)
    http.HandleFunc("/user/", controller.User)

    fmt.Println("Running server on port: " + strconv.Itoa(conf.Service.Port))
    http.ListenAndServe(":" + strconv.Itoa(conf.Service.Port), nil)
}
