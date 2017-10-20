package main

import (
    "fmt"
    "net/http"
    "users/controller"
)


func main() {
    http.HandleFunc("/", about)
    http.HandleFunc("/user/", user)
    http.HandleFunc("/login/", login)
    http.HandleFunc("/logout/", logout)
    http.HandleFunc("/change_password/", change_password)
    
    fmt.Println("Service started.")
    http.ListenAndServe(":8080", nil)
}
