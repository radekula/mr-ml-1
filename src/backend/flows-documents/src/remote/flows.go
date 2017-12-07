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
    
    url := config.Remotes.Flows + "/flow/" + flow + "/steps/"+ token 

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
