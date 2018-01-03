package remote

import (
    "net/http"
    "encoding/json"
    "strconv"
    "../config"
    "../model"
)


func GetUserActions(login string, token string, params map[string][]string) (model.UserActions) {
    var actions model.UserActions
    var actionsList model.UserActions

    config := config.GetConfig()

    limit := -1
    offset := -1

    if value, ok := params["limit"]; ok {
        m_limit, err := strconv.Atoi(value[0])
        if (err != nil ) {
            return actions
        }
        limit = m_limit
    }

    if value, ok := params["offset"]; ok {
        m_offset, err := strconv.Atoi(value[0])
        if (err != nil ) {
            return actions
        }
        offset = m_offset
    }

    url := config.Remotes.FlowsDocuments + "/user/" + login + "/current_actions/" + token

    resp, err2 := http.Get(url)
    if err2 != nil {
        return actions
    }

    if resp.StatusCode != 200 {
        return actions
    }

    json.NewDecoder(resp.Body).Decode(&actionsList)

    // Apply offset
    row := 0
    for _, action := range actionsList.Result {
        if row > offset {
            if limit > -1 {
                if row >= limit {
                    break
                }
            }
            actions.Result = append(actions.Result, action)
        }
        row = row + 1
    }

    actions.Total = actionsList.Total

    return actions
}
