package remote

import (
    "net/http"
    "encoding/json"
    "strconv"
    "../config"
    "../model"
)


func GetUserComments(login string, token string, params map[string][]string) (model.UserComments) {
    var comments model.UserComments
    var remotes []model.RemoteCommentData

    config := config.GetConfig()

    limit := -1
    offset := -1

    if value, ok := params["limit"]; ok {
        m_limit, err := strconv.Atoi(value[0])
        if (err != nil ) {
            return comments
        }
        limit = m_limit
    }

    if value, ok := params["offset"]; ok {
        m_offset, err := strconv.Atoi(value[0])
        if (err != nil ) {
            return comments
        }
        offset = m_offset
    }

    url := config.Remotes.Comments + "/comments/" + token + "?userId=" + login

    resp, err2 := http.Get(url)
    if err2 != nil {
        return comments
    }

    if resp.StatusCode != 200 {
        return comments
    }

    json.NewDecoder(resp.Body).Decode(&remotes)

    comments.Total = len(remotes)

    row := 0
    for _, remote := range remotes {
        if row > offset {
            if limit > -1 {
                if row >= limit {
                    break
                }
            }

            var comment model.CommentData

            comment.Document   = remote.Document
            comment.Author     = remote.Author
            comment.Content    = remote.Content
            comment.CreateDate = remote.CreateDate

            comments.Result = append(comments.Result, comment)
        }
        row = row + 1
    }

    return comments
}
