package controller


import (
    "strings"
    "strconv"
    "encoding/json"
    "net/http"
    "regexp"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
    "github.com/satori/go.uuid"
    "../model"
    "../remote"
    "../db"
//    "fmt"
)


func getFlows(c *mgo.Collection, params map[string][]string) ([]model.FlowData, int) {
    var search_data []model.DBFlowData
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

    return flows, total
}



func getFlow(c *mgo.Collection, id string) (model.FlowData, int) {
    var ret_data model.FlowData

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

    return ret_data, 0
}


func createFlow(c *mgo.Collection, id string, data model.FlowData) (int) {
    if id != "generate" {
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

    db.GetCollectionSteps().Insert(&end_data)
    return 0
}


func updateFlow(c *mgo.Collection, id string, data model.FlowData) (int) {
    org_data, err := getFlow(c, id)
    
    if err != 0 {
        return 1
    }

    if len(data.Id) > 1                  {org_data.Id = data.Id}
    if len(data.Name) > 1                {org_data.Name = data.Name}
    if org_data.Active != data.Active    {org_data.Active = data.Active}
    if len(data.Owner) > 1               {org_data.Owner = data.Owner}
    if len(data.CreateDate) > 1          {org_data.CreateDate = data.CreateDate}
    if len(data.Description) > 1         {org_data.Description = data.Description}

    data_change := bson.M{"id"            : org_data.Id, 
                          "name"          : org_data.Name,
                          "active"        : org_data.Active,
                          "owner"         : org_data.Owner,
                          "create_date"   : org_data.CreateDate,
                          "description"   : org_data.Description}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"id": id}).Apply(change, &org_data)

    return 0
}



func deleteFlow(c *mgo.Collection, id string) (int) {
    _, err := getFlow(c, id)
    
    if err != 0 {
        return 1
    }

    c.Remove(bson.M{"id": id})

    return 0
}



func getSteps(c *mgo.Collection, flow string) ([]model.StepData, int) {
    var search_data []model.DBStepData
    var steps []model.StepData

    c.Find(bson.M{"flow": flow}).All(&search_data)

    for _, s := range search_data {
        var step model.StepData

        step.Id           = s.Id
        step.Type         = s.Type
        step.Prev         = s.Prev
        step.Participants = s.Participants
        step.Description  = s.Description

        steps = append(steps, step)
    }

    return steps, 0 
}



func getStep(c *mgo.Collection, flow string, id string) (model.StepData, int) {
    var ret_data model.StepData

    var search_data model.DBStepData

    count, _ := c.Find(bson.M{"id": id}).Count()
    if count != 1 {
        return ret_data, -1
    }

    err := c.Find(bson.M{"id": id}).One(&search_data)
    if err != nil {
        return ret_data, -1
    }

    ret_data.Id           = search_data.Id
    ret_data.Type         = search_data.Type
    ret_data.Prev         = search_data.Prev
    ret_data.Participants = search_data.Participants
    ret_data.Description  = search_data.Description

    return ret_data, 0
}


func createStep(c *mgo.Collection, flow string, id string, data model.StepData, split bool) (int) {
    if id != "generate" {
        _, err := getStep(c, flow, id)
        if err == 0 {
            return 1
        }
    } else {
        id = uuid.NewV4().String()
    }

    // check if type is correct
    if data.Type == "start" || data.Type == "archive" {
        return 2
    }

    // check if previous steps are correct
    for _, prev := range data.Prev {
        step, err := getStep(c, flow, prev)
        if err != 0 || step.Type == "archive" {
            return 3
        }
    }

    // if we split we have less work to do: 
    if split {
        // we add new step
        var add_data model.DBStepData

        add_data.Id           = id
        add_data.Flow         = flow
        add_data.Type         = data.Type
        add_data.Prev         = data.Prev
        add_data.Participants = data.Participants
        add_data.Description  = data.Description
        
        c.Insert(&add_data)

        // with split we always add archive step
        var archive model.DBStepData

        archive.Id           = uuid.NewV4().String()
        archive.Flow         = flow
        archive.Type         = "archive"
        archive.Prev         = append(archive.Prev, add_data.Id)
        
        c.Insert(&archive)
    } else {
        // we need to get all steps that points to same previous steps
        var next_steps []model.DBStepData

        for _, prev := range data.Prev {
            var search_data []model.DBStepData

            err := c.Find(bson.M{"flow": flow, "prev": bson.M{"$in": []string{prev}}}).All(&search_data)

            if err != nil {
                return -1
            }
    
            for _, s := range search_data {
                next_steps = append(next_steps, s)
            }
        }

        // we add new step
        var add_data model.DBStepData

        add_data.Id           = id
        add_data.Flow         = flow
        add_data.Type         = data.Type
        add_data.Prev         = data.Prev
        add_data.Participants = data.Participants
        add_data.Description  = data.Description
        
        c.Insert(&add_data)

        // we update next steps with new previous step
        for _, next_step := range next_steps {
            data_change := bson.M{"prev": []string{add_data.Id}}

            change := mgo.Change{
                Update:  bson.M{"$set": data_change},
                ReturnNew: false,
            }

            c.Find(bson.M{"id": next_step.Id, "flow": flow}).Apply(change, &next_step)
        }
        
        // we clean if there are more than one archive steps
        var search_data []model.DBStepData
        err := c.Find(bson.M{"flow": flow, "type": "archive", "prev": bson.M{"$in": []string{add_data.Id}}}).All(&search_data)
        if err != nil {
            return -1
        }
        
        for idx, archive_step := range search_data {
            // one must always be there
            if idx == 0 {
                continue
            }

            c.Remove(bson.M{"id": archive_step.Id, "flow": flow})
        }
    }

    return 0
}


func updateStep(c *mgo.Collection, flow string, id string, data model.StepData) (int) {
    org_data, err := getStep(c, flow, id)

    if err != 0 {
        return 1
    }

    // we cannot change step type to start or archive
    if data.Type == "archive" || data.Type == "start" {
        return 2
    }

    // we cannot change step id
    if data.Id != org_data.Id {
        return 2
    }


    // we search differences in prev
    prevChange := false
    if len(data.Prev) != len(org_data.Prev) {
        prevChange = true
    } else {
        for _, p1 := range data.Prev {
            exist := false
            for _, p2 := range org_data.Prev {
                if p1 == p2 {
                    exist = true
                    break
                }
            }
            if exist == false {
                prevChange = true
                break
            }
        }
    }

    // no change in prev - simple update
    if prevChange == false { 
        if len(data.Description) > 1 {org_data.Description = data.Description}
        org_data.Participants = data.Participants

        data_change := bson.M{"participants"  : org_data.Participants,
                              "description"   : org_data.Description}

        change := mgo.Change{
            Update:  bson.M{"$set": data_change},
            ReturnNew: false,
        }

        c.Find(bson.M{"id": id}).Apply(change, &org_data)
    } else {
        // prev changed so we need to delete step and add again in different place
        ret := deleteStep(c, flow, id)
        
        if ret != 0 {
            return ret
        }
        
        ret2 := createStep(c, flow, id, data, false)
        if ret2 != 0 {
            return ret2
        }
    }

    return 0
}



func deleteStep(c *mgo.Collection, flow string, id string) (int) {
    // get step to delete
    org_data, err := getStep(c, flow, id)
    if err != 0 {
        return 1
    }

    // check if type is correct
    if org_data.Type == "start" || org_data.Type == "archive" {
        return 2
    }

    // we need to find all steps that follow this step
    var next_steps []model.DBStepData        
    err1 := c.Find(bson.M{"flow": flow, "prev": bson.M{"$in": []string{id}}}).All(&next_steps)
    if err1 != nil {
        return -1
    }

    // we update next steps with new previous steps
    for _, step := range next_steps {
        data_change := bson.M{"prev": org_data.Prev}

        change := mgo.Change{
            Update:  bson.M{"$set": data_change},
            ReturnNew: false,
        }

        c.Find(bson.M{"id": step.Id, "flow": flow}).Apply(change, &step)
    }

    // finally we can delete step
    c.Remove(bson.M{"id": id})

    return 0
}



func flowHandler(w http.ResponseWriter, r *http.Request) {
    request := strings.Split(r.URL.Path, "/")

    id    := request[2]
    token := request[3]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            flow, ret := getFlow(db.GetCollection(), id)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            json_message, err_json := json.Marshal(flow)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
            break
        case "POST":
            var data model.FlowData
            
            err := json.NewDecoder(r.Body).Decode(&data)
            if err != nil {
                w.WriteHeader(http.StatusBadRequest)
                return
            }

            ret := createFlow(db.GetCollection(), id, data)

            if ret != 0 {
                switch ret {
                    case 1:
                        w.WriteHeader(http.StatusConflict)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            w.WriteHeader(http.StatusOK)
            break
        case "PUT":
            var data model.FlowData
            
            err := json.NewDecoder(r.Body).Decode(&data)
            if err != nil {
                w.WriteHeader(http.StatusBadRequest)
                return
            }

            ret := updateFlow(db.GetCollection(), id, data)

            if ret != 0 {
                switch ret {
                    case 1:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            w.WriteHeader(http.StatusOK)
            break
        case "DELETE":
            ret := deleteFlow(db.GetCollection(), id)

            if ret != 0 {
                switch ret {
                    case 1:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            w.WriteHeader(http.StatusOK)
            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            break
    }
}



func stepHandler(w http.ResponseWriter, r *http.Request) {
    request := strings.Split(r.URL.Path, "/")

    flow  := request[2]
    id    := request[4]
    token := request[5]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            step, ret := getStep(db.GetCollectionSteps(), flow, id)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            json_message, err_json := json.Marshal(step)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
            break
        case "POST":
            var data model.StepData
            
            err := json.NewDecoder(r.Body).Decode(&data)
            if err != nil {
                w.WriteHeader(http.StatusBadRequest)
                return
            }

            params := r.URL.Query()
            split := false

            if value, ok := params["split"]; ok {
                m_split, err := strconv.Atoi(value[0])
                if (err != nil ) {
                    w.WriteHeader(http.StatusBadRequest)
                    return
                }

                if m_split > 0 {
                    split = true
                }
            }

            ret := createStep(db.GetCollectionSteps(), flow, id, data, split)

            if ret != 0 {
                switch ret {
                    case 1:
                        w.WriteHeader(http.StatusConflict)
                        break
                    case 2:
                        w.WriteHeader(http.StatusConflict)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            w.WriteHeader(http.StatusOK)
            break
        case "PUT":
            var data model.StepData
            
            err := json.NewDecoder(r.Body).Decode(&data)
            if err != nil {
                w.WriteHeader(http.StatusBadRequest)
                return
            }

            ret := updateStep(db.GetCollectionSteps(), flow, id, data)

            if ret != 0 {
                switch ret {
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
                return
            }

            w.WriteHeader(http.StatusOK)
            break
        case "DELETE":
            ret := deleteStep(db.GetCollectionSteps(), flow, id)

            if ret != 0 {
                switch ret {
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
                return
            }

            w.WriteHeader(http.StatusOK)
            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            break
    }
}



func stepsHandler(w http.ResponseWriter, r *http.Request) {
    request := strings.Split(r.URL.Path, "/")

    flow  := request[2]
    token := request[4]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            steps, ret := getSteps(db.GetCollectionSteps(), flow)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            json_message, err_json := json.Marshal(steps)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            break
    }
}



func About(w http.ResponseWriter, r *http.Request) {
    test := model.AboutData{"Version: 0.1"}

    message, err := json.Marshal(test)

    if err != nil {
        panic(err)
    }

    w.Write(message)
}



func Flows(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("flows/[^/]*$")

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
    token  := request[2]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            flows, total := getFlows(db.GetCollection(), r.URL.Query())

            if total < 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            return_data := struct {
                Total   int                  `json:"total"`
                Result  []model.FlowData     `json:"result"`
            } {
                total,
                flows,
            }

            json_message, err_json := json.Marshal(return_data)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            w.Write(json_message)
            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}


func Flow(w http.ResponseWriter, r *http.Request) {
    re_flow, err := regexp.CompilePOSIX("flow/[^/]*/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    re_step, err := regexp.CompilePOSIX("flow/[^/]*/step/[^/]*/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    re_steps, err := regexp.CompilePOSIX("flow/[^/]*/steps/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }
    
    valid_request_flow  := re_flow.FindString(r.URL.Path[1:])
    valid_request_step  := re_step.FindString(r.URL.Path[1:])
    valid_request_steps := re_steps.FindString(r.URL.Path[1:])

    if valid_request_flow  == "" && 
       valid_request_step  == "" && 
       valid_request_steps == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    if valid_request_flow != "" {
        flowHandler(w, r);
    }

    if valid_request_step != "" {
        stepHandler(w, r);
    }

    if valid_request_steps != "" {
        stepsHandler(w, r);
    }

    return
}
