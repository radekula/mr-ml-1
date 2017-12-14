package model

type DBComment struct {
	Id         string `bson:"id,omitempty"`
	DocumentId string `bson:"document_id,omitempty"`
	Parent     string `bson:"parent,omitempty"`
	Author     string `bson:"author,omitempty"`
	CreateDate string `bson:"create_date,omitempty"`
	Content    string `bson:"description,omitempty"`
}
