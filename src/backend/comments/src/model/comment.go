package model

type Comment struct {
	Id         string `json:"id"`
	DocumentId string `json:"document_id"`
	Parent     string `json:"parent"`
	Author     string `json:"author"`
	CreateDate string `json:"create_date"`
	Content    string `json:"content"`
}

type NewComment struct {
	DocumentId string `json:"document_id"`
	Parent     string `json:"parent"`
	Content    string `json:"content"`
}

type CommentId struct {
	Id string `json:"id"`
}
