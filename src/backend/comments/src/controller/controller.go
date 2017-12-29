package controller

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/satori/go.uuid"
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
		"content":     1}

	findBy := bson.M{}
	sortBy := "document_id"

	if value, ok := params["documentId"]; ok {
		findBy = bson.M{"document_id": value[0]}
	}

	if value, ok := params["userId"]; ok {
		findBy = bson.M{"author": value[0]}
	}

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

func writeComment(c *mgo.Collection, comment model.NewComment, login string) (model.CommentId, int) {
	var addData model.DBComment
	var commentID model.CommentId

	t := time.Now()

	addData.Id = uuid.NewV4().String()
	addData.DocumentId = comment.DocumentId
	addData.Parent = comment.Parent
	addData.Author = login
	addData.CreateDate = t.Format(time.UnixDate)
	addData.Content = comment.Content

	c.Insert(&addData)

	commentID.Id = addData.Id
	return commentID, 0
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

		comments := getComments(db.GetCollection(), r.URL.Query())

		jsonMessage, errJSON := json.Marshal(comments)
		if errJSON != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Write(jsonMessage)
	case "POST":
		var comment model.NewComment

		if len(pathArr) != 2 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		token := pathArr[1]
		login, ret := remote.VerifyToken(token)
		if ret != 200 {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		err := json.NewDecoder(r.Body).Decode(&comment)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
		}

		commentId, ret := writeComment(db.GetCollection(), comment, login.Login)
		if ret > 0 {
			w.WriteHeader(http.StatusConflict)
			return
		}

		jsonMessage, errJSON := json.Marshal(commentId)
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
