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


func GetUser(token string) (model.UserData, int) {
    var user model.UserData

    verified, err := VerifyToken(token)
    if err != 200 {
        return user, 1
    }

    config := config.GetConfig()

    url := config.Remotes.Users + "/user/" + verified.Login + "/" + token

    resp, err2 := http.Get(url)
    if err2 != nil {
        return user, 500
    }

    if resp.StatusCode != 200 {
        return user, resp.StatusCode
    }

    json.NewDecoder(resp.Body).Decode(&user)
    return user, 200
}
