package remote

import (
    "net/http"
    "../config"
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
