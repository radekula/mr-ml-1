package remote

import (
    "encoding/json"
    "net/http"
    "../model"
    "../config"
)


func VerifyToken(token string) (model.VerifyData, int) {
    var verify_data model.VerifyData

    config := config.GetConfig()

    url := config.Remotes.Users + "/verify/" + token 

    resp, err := http.Get(url)
    if err != nil {
        return verify_data, 500
    }

    if resp.StatusCode != 200 {
        return verify_data, resp.StatusCode
    }

    json.NewDecoder(resp.Body).Decode(&verify_data)

    return verify_data, 200
}


func CheckUserExists(login string, token string) (bool) {
    config := config.GetConfig()

    url := config.Remotes.Users + "/user/" + login + "/" + token 

    resp, err := http.Get(url)
    if err != nil {
        return false
    }

    if resp.StatusCode != 200 {
        return false
    }

    return true
}
