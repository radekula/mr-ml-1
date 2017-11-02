package main

import (
    "fmt"
    "net/http"
    "./app_init"
    "./controller"
)


func main() {
    app_init.Init()
    
    http.HandleFunc("/", controller.About)
    http.HandleFunc("/user/", controller.User)
    http.HandleFunc("/login/", controller.Login)
    http.HandleFunc("/logout/", controller.Logout)
    http.HandleFunc("/change_password/", controller.ChangePassword)
    http.HandleFunc("/verify/", controller.Verify)

    fmt.Println("Service started.")
    http.ListenAndServe(":8080", nil)
}
