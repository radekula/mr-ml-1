package remote

import (
    "encoding/json"
    "net/http"
    "../model"
    "../config"
)


func GetUserGroups(login string, token string) ([]string, int) {
    var groups []string
    var searchData []model.GroupDataFull

    config := config.GetConfig()

    url := config.Remotes.Groups + "/user/" + login + "/groups/" + token 

    resp, err := http.Get(url)
    if err != nil {
        return groups, 500
    }

    if resp.StatusCode == 404 {
        return groups, 200
    }

    if resp.StatusCode != 200 {
        return groups, resp.StatusCode
    }

    json.NewDecoder(resp.Body).Decode(&searchData)

    for _, group := range searchData {
        groups = append(groups, group.Name)
    }

    return groups, 200
}
