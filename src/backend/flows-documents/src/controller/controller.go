package controller


import (
    "strings"
//    "strconv"
    "encoding/json"
    "net/http"
    "regexp"
    "gopkg.in/mgo.v2"
//    "gopkg.in/mgo.v2/bson"
    "../model"
    "../remote"
    "../db"
//    "fmt"
)



func startFlow(c *mgo.Collection, data model.StartFlow, user model.VerifyData) (int) {
/*    var search_data []model.DBFlowData
    var flows []model.FlowData

    find_by := bson.M{}
    sort_by := "name"
    limit := -1
    offset := 0

    if value, ok := params["limit"]; ok {
        m_limit, err := strconv.Atoi(value[0])
        if (err != nil ) {
            return flows, -1
        }
        limit = m_limit
    }

    if value, ok := params["offset"]; ok {
        m_offset, err := strconv.Atoi(value[0])
        if (err != nil ) {
            return flows, -1
        }
        offset = m_offset
    }

    if value, ok := params["search"]; ok {
        find_by = bson.M{"name":bson.RegEx{".*" + value[0] + ".*", ""}}
    }
    
    total, _ := c.Find(find_by).Count()
    
    if limit < 0 {
        limit = total
    }

    c.Find(find_by).Sort(sort_by).Skip(offset).Limit(limit).All(&search_data)

    for _, f := range search_data {
        var flow model.FlowData

        flow.Id          = f.Id
        flow.Name        = f.Name
        flow.Active      = f.Active
        flow.Owner       = f.Owner
        flow.CreateDate  = f.CreateDate
        flow.Description = f.Description

        flows = append(flows, flow)
    }
*/
    return 0
}



func getStatus(c *mgo.Collection, document string) (model.StatusData, int) {
    var ret_data model.StatusData
/*
    var search_data model.DBFlowData

    count, _ := c.Find(bson.M{"id": id}).Count()
    if count != 1 {
        return ret_data, -1
    }

    err := c.Find(bson.M{"id": id}).One(&search_data)
    if err != nil {
        return ret_data, -1
    }

    ret_data.Id          = search_data.Id
    ret_data.Name        = search_data.Name
    ret_data.Active      = search_data.Active
    ret_data.Owner       = search_data.Owner
    ret_data.CreateDate  = search_data.CreateDate
    ret_data.Description = search_data.Description
*/
    return ret_data, 0
}



func actionPerform(c *mgo.Collection, document string, step string, user model.VerifyData) (int) {
/*    if id != "generate" {
        _, err := getFlow(c, id)
        if err == 0 {
            return 1
        }
    } else {
        id = uuid.NewV4().String()
    }

    var add_data model.DBFlowData
    
    add_data.Id          = id
    add_data.Name        = data.Name
    add_data.Active      = data.Active
    add_data.Owner       = data.Owner
    add_data.CreateDate  = data.CreateDate
    add_data.Description = data.Description

    c.Insert(&add_data)

    var start_data model.DBStepData

    start_data.Id           = uuid.NewV4().String()
    start_data.Flow         = id
    start_data.Type         = "start"

    db.GetCollectionSteps().Insert(&start_data)

    var end_data model.DBStepData

    end_data.Id           = uuid.NewV4().String()
    end_data.Flow         = id
    end_data.Prev         = append(end_data.Prev, start_data.Id)
    end_data.Type         = "archive"

    db.GetCollectionSteps().Insert(&end_data)*/
    return 0
}




func actionDelete(c *mgo.Collection, document string, step string, user model.VerifyData) (int) {
/*    if id != "generate" {
        _, err := getFlow(c, id)
        if err == 0 {
            return 1
        }
    } else {
        id = uuid.NewV4().String()
    }

    var add_data model.DBFlowData
    
    add_data.Id          = id
    add_data.Name        = data.Name
    add_data.Active      = data.Active
    add_data.Owner       = data.Owner
    add_data.CreateDate  = data.CreateDate
    add_data.Description = data.Description

    c.Insert(&add_data)

    var start_data model.DBStepData

    start_data.Id           = uuid.NewV4().String()
    start_data.Flow         = id
    start_data.Type         = "start"

    db.GetCollectionSteps().Insert(&start_data)

    var end_data model.DBStepData

    end_data.Id           = uuid.NewV4().String()
    end_data.Flow         = id
    end_data.Prev         = append(end_data.Prev, start_data.Id)
    end_data.Type         = "archive"

    db.GetCollectionSteps().Insert(&end_data)*/
    return 0
}


func documentForce(c *mgo.Collection, document string, step string, user model.VerifyData) (int) {
/*    if id != "generate" {
        _, err := getFlow(c, id)
        if err == 0 {
            return 1
        }
    } else {
        id = uuid.NewV4().String()
    }

    var add_data model.DBFlowData
    
    add_data.Id          = id
    add_data.Name        = data.Name
    add_data.Active      = data.Active
    add_data.Owner       = data.Owner
    add_data.CreateDate  = data.CreateDate
    add_data.Description = data.Description

    c.Insert(&add_data)

    var start_data model.DBStepData

    start_data.Id           = uuid.NewV4().String()
    start_data.Flow         = id
    start_data.Type         = "start"

    db.GetCollectionSteps().Insert(&start_data)

    var end_data model.DBStepData

    end_data.Id           = uuid.NewV4().String()
    end_data.Flow         = id
    end_data.Prev         = append(end_data.Prev, start_data.Id)
    end_data.Type         = "archive"

    db.GetCollectionSteps().Insert(&end_data)*/
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

    user, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

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
            data, ret := getStatus(db.GetCollection(), document)

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

    user, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

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

    user, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

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
