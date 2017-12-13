package controller

import (
	"encoding/json"
	"net/http"
	"strings"

	"../model"
	"../remote"
)

// Comments - REST handler
//
// GET /comments/{token}
// POST /comments/{token}
// PUT /comments/{id}/{token}
// DELETE /comments/{id}/{token}
func Comments(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(r.URL.Path, "/")
	pathArr := strings.Split(path, "/")

	if pathArr[0] != "comments" {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	switch r.Method {
	case "GET":
		if len(pathArr) != 2 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		token := pathArr[1]
		_, ret := remote.VerifyToken(token)
		if ret != 200 {
			w.WriteHeader(http.StatusForbidden)
			return
		}
		w.Write([]byte("Pobranie komentarzy. Token: " + token))
	}

}

// About - REST handler
//
// GET /
func About(w http.ResponseWriter, r *http.Request) {
	test := model.AboutData{"Version: 0.1"}
	message, err := json.Marshal(test)
	if err != nil {
		panic(err)
	}
	w.Write(message)
}
