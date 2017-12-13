package main

import (
	"fmt"
	"net/http"
	"strconv"

	"./config"
	"./controller"
)

func main() {
	conf := config.GetConfig()

	http.HandleFunc("/", controller.About)
	http.HandleFunc("/comments/", controller.Comments)

	fmt.Println("Running server on port: " + strconv.Itoa(conf.Service.Port))
	http.ListenAndServe(":"+strconv.Itoa(conf.Service.Port), nil)
}
