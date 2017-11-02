package main

import (
    "fmt"
    "net/http"
    "./config"
    "./controller"
)


func main() {
    config := config.GetConfig()
    
    http.HandleFunc("/", controller.About)
    http.HandleFunc("/groups/", controller.Groups)
    http.HandleFunc("/group/", controller.Group)
    http.HandleFunc("/members/", controller.Members)
    http.HandleFunc("/user/", controller.User)

    fmt.Println("Service started.")
    http.ListenAndServe(":" + config.Service.Port, nil)
}
