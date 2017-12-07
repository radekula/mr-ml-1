package remote

import (
    "encoding/json"
    "net/http"
    "../model"
    "../config"
)


func GetFlowSteps(flow string, token string) ([]model.StepData, int) {
    var stepsData[] model.StepData

    config := config.GetConfig()

    url := config.Remotes.Flows + "/flow/" + flow + "/steps/" + token 

    resp, err := http.Get(url)
    if err != nil {
        return stepsData, 500
    }

    if resp.StatusCode != 200 {
        return stepsData, resp.StatusCode
    }

    json.NewDecoder(resp.Body).Decode(&stepsData)
    
    return stepsData, 200
}



func GetStepData(flow string, step string, token string) (model.StepData, int) {
    var stepData model.StepData

    config := config.GetConfig()

    url := config.Remotes.Flows + "/flow/" + flow + "/step/" + step + "/" + token 

    resp, err := http.Get(url)
    if err != nil {
        return stepData, 500
    }

    if resp.StatusCode != 200 {
        return stepData, resp.StatusCode
    }

    json.NewDecoder(resp.Body).Decode(&stepData)
    
    return stepData, 200
}



func GetUsersForStep(flow string, step string, token string) ([]string, int) {
    var users []string
    var remoteStep model.StepData

    // search for step data
    config := config.GetConfig()

    url := config.Remotes.Flows + "/flow/" + flow + "/step/" + step + "/" + token 

    resp, err := http.Get(url)
    if err != nil {
        return users, 500
    }

    if resp.StatusCode != 200 {
        return users, resp.StatusCode
    }

    json.NewDecoder(resp.Body).Decode(&remoteStep)

    // for each user in step check if it is a group
    for _, u := range remoteStep.Participants {
        var members []string
        url := config.Remotes.Groups + "/members/get/" + u + "/" + token
        
        resp, err := http.Get(url)
        if err != nil {
            return users, 500
        }

        if resp.StatusCode != 200 {
            users = append(users, u)
        }

        json.NewDecoder(resp.Body).Decode(&members)

        users = append(users, members...)
    }
    
    return users, 0
}
