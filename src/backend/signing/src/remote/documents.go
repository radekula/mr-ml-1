package remote

import (
    "net/http"
    "encoding/json"
    "../config"
    "../model"
)



func GetDocument(id string, token string) (model.Document, int) {
    var document model.Document

    config := config.GetConfig()

    url := config.Remotes.Documents + "/document/" + id + "/" + token

    resp, err2 := http.Get(url)
    if err2 != nil {
        return document, 500
    }

    if resp.StatusCode != 200 {
        return document, resp.StatusCode
    }

    json.NewDecoder(resp.Body).Decode(&document)

    return document, 200
}
