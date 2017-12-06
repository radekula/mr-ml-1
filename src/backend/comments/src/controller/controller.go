package controller

import (
	"encoding/json"
	"net/http"

	"../model"
)

// Document - REST handler
//
// GET /comments/{token}
// POST /comments/{token}
// PUT /comments/{id}/{token}
// DELETE /comments/{id}/{token}
func Document(w http.ResponseWriter, r *http.Request) {
	About(w, r)
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
