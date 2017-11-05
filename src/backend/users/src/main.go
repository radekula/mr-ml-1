package main

import (
    "fmt"
    "net/http"
    "./app_init"
    "./controller"
    "./config"
    "strconv"
)


func main() {
    conf := config.GetConfig()
    app_init.Init()

    http.HandleFunc("/", controller.About)
    http.HandleFunc("/user/", controller.User)
    http.HandleFunc("/login/", controller.Login)
    http.HandleFunc("/logout/", controller.Logout)
    http.HandleFunc("/change_password/", controller.ChangePassword)
    http.HandleFunc("/verify/", controller.Verify)

    fmt.Println("Running server on port: " + strconv.Itoa(conf.Service.Port))
    http.ListenAndServe(":" + strconv.Itoa(conf.Service.Port), nil)
}
