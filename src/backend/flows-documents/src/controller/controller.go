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
    "fmt"
)


func getActionFromStep(stepType string) (string) {
    if stepType == "accept_single" || stepType == "accept_all" {
        return "accept"
    }

    if stepType == "view_single" || stepType == "view_all" {
        return "view"
    }

    if stepType == "sign_single" || stepType == "sign_all" {
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



func checkActionToNextStep(actions []model.DBHistoryAction, stepType string, users []string) (bool) {
    var usersMap map[string]bool
    usersMap = make(map[string]bool)

    for _, u := range users {
        usersMap[u] = false
    }

    switch stepType {
        case "start":
            // always return true
            return true
        case "archive":
            // always return false
            return false
        case "accept_single":
            // check if any user accepted
            for _, a := range actions {
                if a.Action == "accept" {
                    return true
                }
            }
            return false
        case "accept_all":
            // check if all users accepted
            for _, a := range actions {
                if a.Action == "accept" {
                    usersMap[a.Login] = true
                }
            }

            for l, _ := range usersMap {
                if usersMap[l] == false {
                    return false
                }
            }

            return true
        case "view_single":
            // check if any user viewed
            for _, a := range actions {
                if a.Action == "view" {
                    return true
                }
            }
            return false
        case "view_all":
            // check if all users viewed
            for _, a := range actions {
                if a.Action == "view" {
                    usersMap[a.Login] = true
                }
            }

            for l, _ := range usersMap {
                if usersMap[l] == false {
                    return false
                }
            }

            return true
        case "sign_single":
            // check if any user signed
            for _, a := range actions {
                if a.Action == "sign" {
                    return true
                }
            }
            return false
        case "sign_all":
            // check if all users signed
            for _, a := range actions {
                if a.Action == "sign" {
                    usersMap[a.Login] = true
                }
            }

            for l, _ := range usersMap {
                if usersMap[l] == false {
                    return false
                }
            }

            return true
        case "join_any":
// TODO
            return false
        case "join_all":
// TODO
            return false
    }

    return false
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
    if err != 200 {
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
        documentFlow.History = append(documentFlow.History, h)
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
    if count == 0 {
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
    if count == 0 {
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

    // get step history
    var stepHistory *model.DBHistoryData

    for idx, _ := range search_data.History {
        if search_data.History[idx].Step == step {
            stepHistory = &search_data.History[idx]
        }
    }

    // check if user already performed action
    for _, a := range stepHistory.Actions {
        if a.Login == user.Login {
            return 3
        }
    }

    // add user action
    var act model.DBHistoryAction

    act.Login  = user.Login
    act.Action = getActionFromStep(flowStep.Type)
    act.Date   = libs.CurrentTime()

    stepHistory.Actions = append(stepHistory.Actions, act)

    // check if action if enough for next step
    if checkActionToNextStep(stepHistory.Actions, flowStep.Type, users) == true {
        // get steps data for the flow
        steps, err := remote.GetFlowSteps(search_data.Flow, user.Token)
        if err != 200 {
            return 1
        }

        // find next steps
        nextSteps, err4 := getNextSteps(steps, step)
        if err4 != 0 {
            return -1
        }

        search_data.CurrentSteps = nextSteps

        // add empty next steps
        for _, s := range nextSteps {
            var h model.DBHistoryData
            h.Step = s
            search_data.History = append(search_data.History, h)
        }
    }

    // Save changes to database
    data_change := bson.M{"history"       : search_data.History,
                          "current_steps" : search_data.CurrentSteps}

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



func getUserActions(c *mgo.Collection, login string, token string) ([]model.UserAction, int) {
    var actions []model.UserAction

    // get steps from flows definitions where user is assigned
    steps, ret := remote.GetUsersSteps(login, token)
    if ret != 200 {
        return actions, -1
    }

    // for each step search document where current step is the same
    for _, step := range steps {
        var statusData model.DBStatusData
        var action model.UserAction

        // search if there is any document flow with this step as current
        count, _ := c.Find(bson.M{"current_step": step.Id}).Count()
        if count == 0 {
            continue
        }

        c.Find(bson.M{"current_step": step.Id}).One(&statusData)

        action.Document = statusData.Document
        action.Flow = statusData.Flow
        action.FlowName = step.FlowName
        action.Step = step.Id
        action.Type = getActionFromStep(step.Type)
        
        actions = append(actions, action)
    }

    // fill documents titles
    for key, _ := range actions {
        document, err := remote.GetDocumentInfo(actions[key].Document, token)
        if err != 200 {
            continue
        }
        actions[key].Title = document.Title
    }

    return actions, len(actions)
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
            fmt.Println("Bad request")
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}



func UserActions(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("user/[^/]+/current_actions/[^/]+$")

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
    login   := request[2]
    token   := request[4]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            actions, total := getUserActions(db.GetCollection(), login, token)

            if total < 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            return_data := struct {
                Total   int                  `json:"total"`
                Result  []model.UserAction   `json:"result"`
            } {
                total,
                actions,
            }

            json_message, err_json := json.Marshal(return_data)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            w.Write(json_message)
            break
        default:
            fmt.Println("Bad request")
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}
