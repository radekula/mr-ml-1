package remote

import (
    "net/http"
    "../config"
)


func Sign(document string, token string) (int) {
    config := config.GetConfig()

    url := config.Remotes.Signing + "/sign/" + document + "/" + token 

    resp, err := http.Get(url)
    if err != nil {
        return 500
    }

    if resp.StatusCode != 200 {
        return resp.StatusCode
    }

    return 200
}



func Unsign(document string, token string) (int) {
    config := config.GetConfig()

    url := config.Remotes.Signing + "/unsign/" + document + "/" + token 

    resp, err := http.Get(url)
    if err != nil {
        return 500
    }

    if resp.StatusCode != 200 {
        return resp.StatusCode
    }

    return 200
}
