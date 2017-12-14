package controller

import (
	"encoding/json"
	"net/http"
	"strings"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"

	"../db"
	"../model"
	"../remote"
)

func getComments(c *mgo.Collection, params map[string][]string) []model.Comment {
	var searchData []model.DBComment
	var comments []model.Comment

	selectFields := bson.M{
		"id":          1,
		"document_id": 1,
		"parent":      1,
		"author":      1,
		"create_date": 1,
		"description": 1}

	findBy := bson.M{}
	sortBy := "file_name"

	c.Find(findBy).Select(selectFields).Sort(sortBy).All(&searchData)

	for _, d := range searchData {
		var com model.Comment

		com.Id = d.Id
		com.DocumentId = d.DocumentId
		com.Parent = d.Parent

		comments = append(comments, com)
	}

	return comments
}

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
		//w.Write([]byte("Pobranie komentarzy. Token: " + token))
		comments := getComments(db.GetCollection(), r.URL.Query())

		jsonMessage, errJSON := json.Marshal(comments)
		if errJSON != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Write(jsonMessage)
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
