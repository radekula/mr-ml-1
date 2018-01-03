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
    var documents model.Documents
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

    json.NewDecoder(resp.Body).Decode(&documents)
    if documents.Total > 0 {
        document.Id           = documents.Result[0].Id
        document.Title        = documents.Result[0].Title
        document.FileName     = documents.Result[0].FileName
        document.CreateDate   = documents.Result[0].CreateDate
        document.Description  = documents.Result[0].Description
        document.Owner        = documents.Result[0].Owner
        document.Metadata     = documents.Result[0].Metadata
        document.Thumbnail    = documents.Result[0].Thumbnail
    } else {
        return document, 404
    }

    return document, 200
}
