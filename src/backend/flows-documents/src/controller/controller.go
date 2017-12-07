package controller


import (
    "strings"
//    "strconv"
    "encoding/json"
    "net/http"
    "regexp"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
    "../model"
    "../remote"
    "../db"
    "../libs"
//    "fmt"
)


func getActionFromStep(step model.StepData) (string) {
    if step.Type == "accept_single" || step.Type == "accept_all" {
        return "accept"
    }

    if step.Type == "view_single" || step.Type == "view_all" {
        return "view"
    }

    if step.Type == "sign_single" || step.Type == "sign_all" {
        return "sign"
    }

    return "invalid_action"
}



func getStartStep(steps []model.StepData) (model.StepData, int) {
    var step model.StepData

    for _, s := range steps {
        if s.Type == "start" {
            return s, 0
        }
    }

    return step, -1
}



func getNextSteps(steps []model.StepData, step string) ([]string, int) {
    var nextSteps []string

    for _, s := range steps {
        for _, p := range s.Prev {
            if p == step {
                nextSteps = append(nextSteps, s.Id)
            }
        }
    }

    return nextSteps, 0
}


func startFlow(c *mgo.Collection, data model.StartFlow, user model.UserData) (int) {
    // check if document exist
    if remote.CheckValidDocument(data.Document, user.Token) != true {
        return 1
    }

    // check if document is already in other flow
    count, _ := c.Find(bson.M{"document": data.Document}).Count()
    if count > 0 {
        return 2
    }

    // get steps data for the flow
    steps, err := remote.GetFlowSteps(data.Flow, user.Token)
    if err != 0 {
        return 1
    }

    // find starting step for a flow
    startStep, err2 := getStartStep(steps)
    if err2 != 0 {
        return -1
    }

    // add new flow info for document
    var documentFlow model.DBStatusData
    documentFlow.Document     = data.Document
    documentFlow.Flow         = data.Flow
    nextSteps, err3 := getNextSteps(steps, startStep.Id)
    if err3 != 0 {
        return -1
    }
    documentFlow.CurrentSteps = nextSteps

    // add start step to history
    var history model.DBHistoryData
    var action model.DBHistoryAction

    action.Login  = user.Login
    action.Action = "accept"
    action.Date   = libs.CurrentTime()

    history.Step = startStep.Id
    history.Actions = append(history.Actions, action)
    documentFlow.History = append(documentFlow.History, history)

    // add empty next steps
    for _, s := range nextSteps {
        var h model.DBHistoryData
        h.Step = s
        documentFlow.History = append(documentFlow.History, history)
    }

    c.Insert(&documentFlow)

    return 0
}



func getStatus(c *mgo.Collection, document string, token string) (model.StatusData, int) {
    var search_data model.DBStatusData
    var ret_data model.StatusData

    // check if document exist
    if remote.CheckValidDocument(document, token) != true {
        return ret_data, 1
    }

    // check if document is in a flow
    count, _ := c.Find(bson.M{"document": document}).Count()
    if count > 0 {
        return ret_data, 1
    }

    // find document's steps history
    err := c.Find(bson.M{"document": document}).One(&search_data)
    if err != nil {
        return ret_data, -1
    }

    ret_data.Document          = search_data.Document
    ret_data.Flow              = search_data.Flow
    ret_data.CurrentSteps      = search_data.CurrentSteps

    for _, h := range search_data.History {
        var hist model.HistoryData
        
        hist.Step = h.Step
        for _, a := range h.Actions {
            var act model.HistoryAction

            act.Login = a.Login
            act.Action = a.Action
            act.Date = a.Date

            hist.Actions = append(hist.Actions, act)
        }

        ret_data.History = append(ret_data.History, hist)
    }

    return ret_data, 0
}



func actionPerform(c *mgo.Collection, document string, step string, user model.UserData) (int) {
    var search_data model.DBStatusData

    // check if document exist
    if remote.CheckValidDocument(document, user.Token) != true {
        return 1
    }

    // check if document is in a flow
    count, _ := c.Find(bson.M{"document": document}).Count()
    if count > 0 {
        return 1
    }

    // find document's steps history
    err := c.Find(bson.M{"document": document}).One(&search_data)
    if err != nil {
        return -1
    }

    // check if user is in a step
    users, err2 := remote.GetUsersForStep(search_data.Flow, step, user.Token)
    if err2 != 200 {
        return -1
    }

    userExist := false
    for _, u := range users {
        if u == user.Login {
            userExist = true
            break
        }
    }

    if userExist == false {
        return 2
    }

    // check if step in one of current steps
    inCurrent := false
    for _, s := range search_data.CurrentSteps {
        if s == step {
            inCurrent = true
            break
        }
    }
    if inCurrent == false {
        return 3
    }

    // get step data
    flowStep, err3 := remote.GetStepData(search_data.Flow, step, user.Token)
    if err3 != 200 {
        return -1
    }

    // search and remove user action if exists
    for idx, _ := range search_data.History {
        if search_data.History[idx].Step != step {
            continue
        }

        // check if user already performed action
        for _, a := range search_data.History[idx].Actions {
            if a.Login != user.Login {
                return 3
            }
        }

        var act model.DBHistoryAction

        act.Login  = user.Login
        act.Action = getActionFromStep(flowStep)
        act.Date   = libs.CurrentTime()
    }

//TODO check if action if enough for next step

    data_change := bson.M{"history"       : search_data.History}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"document": search_data.Document, "flow": search_data.Flow}).Apply(change, &search_data)

    return 0
}




func actionDelete(c *mgo.Collection, document string, step string, user model.UserData) (int) {
    var search_data model.DBStatusData

    // check if document exist
    if remote.CheckValidDocument(document, user.Token) != true {
        return 1
    }

    // check if document is in a flow
    count, _ := c.Find(bson.M{"document": document}).Count()
    if count > 0 {
        return 1
    }

    // find document's steps history
    err := c.Find(bson.M{"document": document}).One(&search_data)
    if err != nil {
        return -1
    }

    // check if user is in a step
    users, err2 := remote.GetUsersForStep(search_data.Flow, step, user.Token)
    if err2 != 200 {
        return -1
    }

    userExist := false
    for _, u := range users {
        if u == user.Login {
            userExist = true
            break
        }
    }

    if userExist == false {
        return 2
    }

    // check if step in one of current steps
    inCurrent := false
    for _, s := range search_data.CurrentSteps {
        if s == step {
            inCurrent = true
            break
        }
    }
    if inCurrent == false {
        return 3
    }

    // search and remove user action if exists
    for idx, _ := range search_data.History {
        if search_data.History[idx].Step != step {
            continue
        }

        var act []model.DBHistoryAction

        for _, a := range search_data.History[idx].Actions {
            if a.Login != user.Login {
                act = append(act, a)
            }
        }

        search_data.History[idx].Actions = act
    }

    data_change := bson.M{"history"       : search_data.History}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"document": search_data.Document, "flow": search_data.Flow}).Apply(change, &search_data)

    return 0
}


func documentForce(c *mgo.Collection, document string, step string, user model.UserData) (int) {
// TODO
    return 0
}



func About(w http.ResponseWriter, r *http.Request) {
    test := model.AboutData{"Version: 0.1"}

    message, err := json.Marshal(test)

    if err != nil {
        panic(err)
    }

    w.Write(message)
}



func Start(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("start/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    request := strings.Split(r.URL.Path, "/")
    token   := request[2]

    user, ret := remote.GetUser(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    user.Token = token

    switch r.Method {
        case "POST":
            var data model.StartFlow

            err := json.NewDecoder(r.Body).Decode(&data)
            if err != nil {
                w.WriteHeader(http.StatusBadRequest)
                return
            }

            ret := startFlow(db.GetCollection(), data, user)

            if ret < 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            } else {
                switch ret {
                    case 0:
                        w.WriteHeader(http.StatusOK)
                        break
                    case 1:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    case 2:
                        w.WriteHeader(http.StatusConflict)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
            }
            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}



func Status(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("status/[^/]*/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    request  := strings.Split(r.URL.Path, "/")
    document := request[2]
    token    := request[3]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            data, ret := getStatus(db.GetCollection(), document, token)

            if ret < 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            } else {
                switch ret {
                    case 0:
                        json_message, err_json := json.Marshal(data)
                        if err_json != nil {
                            w.WriteHeader(http.StatusInternalServerError)
                            break
                        } else {
                            w.WriteHeader(http.StatusOK)
                        }
                        w.Write(json_message)
                        break
                    case 1:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
            }

            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}



func Action(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("action/[^/]*/[^/]*/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    request  := strings.Split(r.URL.Path, "/")
    document := request[2]
    step     := request[3]
    token    := request[4]

    user, ret := remote.GetUser(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    user.Token = token

    switch r.Method {
        case "PUT":
            ret := actionPerform(db.GetCollection(), document, step, user)

            if ret < 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            } else {
                switch ret {
                    case 0:
                        w.WriteHeader(http.StatusOK)
                        break
                    case 1:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    case 2:
                        w.WriteHeader(http.StatusNotAcceptable)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
            }
            break
        case "DELETE":
            ret := actionDelete(db.GetCollection(), document, step, user)

            if ret < 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            } else {
                switch ret {
                    case 0:
                        w.WriteHeader(http.StatusOK)
                        break
                    case 1:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    case 2:
                        w.WriteHeader(http.StatusNotAcceptable)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
            }
            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}




func Force(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("force/[^/]*/[^/]*/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    request  := strings.Split(r.URL.Path, "/")
    document := request[2]
    step     := request[3]
    token    := request[4]

    user, ret := remote.GetUser(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    if user.Type != "admin" {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    user.Token = token

    switch r.Method {
        case "PUT":
            ret := documentForce(db.GetCollection(), document, step, user)

            if ret < 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            } else {
                switch ret {
                    case 0:
                        w.WriteHeader(http.StatusOK)
                        break
                    case 1:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    case 2:
                        w.WriteHeader(http.StatusNotAcceptable)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
            }
            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}
