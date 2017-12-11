package remote

import (
    "net/http"
    "encoding/json"
    "../config"
    "../model"
)


func GetUserDocuments(login string, token string, params map[string][]string) (model.UserDocuments) {
    var documents model.UserDocuments
    var query string

    config := config.GetConfig()

    if value, ok := params["limit"]; ok {
        query = "limit=" + value[0]
    }

    if value, ok := params["offset"]; ok {
        if len(query) > 2 {
            query = "&offset=" + value[0]
        } else {
            query = "offset=" + value[0]
        }
    }

    if len(query) > 2 {
        query = "?" + query
    }

    url := config.Remotes.Documents + "/user/" + login + "/documents/" + token + query

    resp, err2 := http.Get(url)
    if err2 != nil {
        return documents
    }

    if resp.StatusCode != 200 {
        return documents
    }

    json.NewDecoder(resp.Body).Decode(&documents)

    return documents
}
