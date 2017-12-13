package model

type CommentData struct {
    Document string               `json:"document"`
    Author string                 `json:"author"`
    Content string                `json:"content"`
    CreateDate string             `json:"create_date"`
}

type UserComments struct {
    Total int               `json:"total"`
    Result []CommentData    `json:"result"`
}

type RemoteCommentData struct {
      Id string                  `json:"id"`
      Document string            `json:"documentId"`
      Parent string              `json:"parent"`
      Author string              `json:"author"`
      CreateDate string          `json:"create_date"`
      Content string             `json:"content"`
}