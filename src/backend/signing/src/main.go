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
    http.HandleFunc("/user/", controller.User)
    http.HandleFunc("/document/", controller.Document)
    http.HandleFunc("/sign/", controller.Sign)
    http.HandleFunc("/unsign/", controller.Unsign)
    http.HandleFunc("/verify/", controller.Verify)

    fmt.Println("Running server on port: " + strconv.Itoa(conf.Service.Port))
    http.ListenAndServe(":" + strconv.Itoa(conf.Service.Port), nil)
}
