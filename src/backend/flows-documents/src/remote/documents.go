package remote

import (
    "net/http"
    "encoding/json"
    "../config"
    "../model"
)



func CheckValidDocument(id string, token string) (bool) {
    config := config.GetConfig()

    url := config.Remotes.Documents + "/document/" + id + "/" + token

    resp, err := http.Get(url)
    if err != nil {
        return false
    }

    if resp.StatusCode != 200 {
        return false
    }

    return true
}


func GetDocumentInfo(id string, token string) (model.DocumentLite, int) {
    var document model.DocumentLite

    config := config.GetConfig()

    url := config.Remotes.Documents + "/documents/" + token + "?search=" + id

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
