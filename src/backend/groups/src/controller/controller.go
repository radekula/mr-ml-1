package controller


import (
    "strings"
    "strconv"
    "encoding/json"
    "net/http"
    "regexp"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
    "../model"
    "../remote"
    "../db"
)


func getGroups(c *mgo.Collection, params map[string][]string) ([]model.GroupDataFull, int) {
    var search_data []model.GroupDataFull
    var groups []model.GroupDataFull

    find_by := bson.M{}
    sort_by := "name"
    limit := -1
    offset := 0
    
    if value, ok := params["limit"]; ok {
        m_limit, err := strconv.Atoi(value[0])
        if (err != nil ) {
            return groups, -1
        }
        limit = m_limit
    }

    if value, ok := params["offset"]; ok {
        m_offset, err := strconv.Atoi(value[0])
        if (err != nil ) {
            return groups, -1
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

    for _, g := range search_data {
        var group model.GroupDataFull
        
        group.Name = g.Name
        group.Active = g.Active
        group.CreateDate = g.CreateDate
        group.Creator = g.Creator
        group.Description = g.Description
        
        groups = append(groups, group)
    }

    return groups, total
}

func getGroup(c *mgo.Collection, name string) (model.GroupDataFull, int) {
    var ret_data model.GroupDataFull

    var search_data model.DBGroupData

    count, _ := c.Find(bson.M{"name": name}).Count()
    if count != 1 {
        return ret_data, -1
    }

    err := c.Find(bson.M{"name": name}).One(&search_data)
    if err != nil {
        return ret_data, -1
    }

    ret_data.Name        = search_data.Name
    ret_data.Active      = search_data.Active
    ret_data.CreateDate  = search_data.CreateDate
    ret_data.Creator     = search_data.Creator
    ret_data.Description = search_data.Description

    return ret_data, 0
}


func createGroup(c *mgo.Collection, name string, data model.GroupData) (int) {
    _, err := getGroup(c, name)
    if err == 0 {
        return 1
    }
    
    var add_data model.DBGroupData
    
    add_data.Name        = name
    add_data.Active      = data.Active
    add_data.CreateDate  = data.CreateDate
    add_data.Creator     = data.Creator
    add_data.Description = data.Description

    c.Insert(&add_data)

    return 0
}


func updateGroup(c *mgo.Collection, name string, data model.GroupData) (int) {
    org_data, err := getGroup(c, name)
    
    if err != 0 {
        return 1
    }

    if org_data.Active != data.Active    {org_data.Active = data.Active}
    if len(data.CreateDate) > 1          {org_data.CreateDate = data.CreateDate}
    if len(data.Creator) > 1             {org_data.Creator = data.Creator}
    if len(data.Description) > 1         {org_data.Description = data.Description}

    data_change := bson.M{"active"        : org_data.Active, 
                          "create_date"   : org_data.CreateDate,
                          "creator"       : org_data.Creator,
                          "description"   : org_data.Description}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"name": name}).Apply(change, &org_data)

    return 0
}



func deleteGroup(c *mgo.Collection, name string) (int) {
    _, err := getGroup(c, name)
    
    if err != 0 {
        return 1
    }

    c.Remove(bson.M{"name": name})

    return 0
}


func getMembers(c *mgo.Collection, name string) ([]string, int) {
    var search_data model.DBGroupData
    var members []string

    count, _ := c.Find(bson.M{"name": name}).Count()
    if count != 1 {
        return members, -1
    }

    err := c.Find(bson.M{"name": name}).One(&search_data)
    if err != nil {
        return members, -1
    }
    
    for _, member := range search_data.Members {
        members = append(members, member.Name)
    }
    
    return members, 0 
}



func addMembers(c *mgo.Collection, name string, new_members []string) (int) {
    var search_data model.DBGroupData

    count, _ := c.Find(bson.M{"name": name}).Count()
    if count != 1 {
        return -1
    }

    err := c.Find(bson.M{"name": name}).One(&search_data)
    if err != nil {
        return -1
    }

    membersMap := make(map[string]bool)

    for _, member := range search_data.Members {
        membersMap[member.Name] = true
    }

    for _, new_member := range new_members {
        membersMap[new_member] = true
    }

    var mod_members []model.DBMemberData

    for member_name, _ := range membersMap {
        var m model.DBMemberData
        m.Name = member_name
        mod_members = append(mod_members, m)
    }

    data_change := bson.M{"members": mod_members}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"name": name}).Apply(change, &search_data)

    return 0 
}



func removeMembers(c *mgo.Collection, name string, del_members []string) (int) {
    var search_data model.DBGroupData

    count, _ := c.Find(bson.M{"name": name}).Count()
    if count != 1 {
        return -1
    }

    err := c.Find(bson.M{"name": name}).One(&search_data)
    if err != nil {
        return -1
    }

    membersMap := make(map[string]bool)

    for _, member := range search_data.Members {
        membersMap[member.Name] = true
    }

    for _, del_member := range del_members {
        membersMap[del_member] = false
    }

    var mod_members []model.DBMemberData

    for member_name, stay := range membersMap {
        if stay == true {
            var m model.DBMemberData
            m.Name = member_name
            mod_members = append(mod_members, m)
        }
    }

    data_change := bson.M{"members": mod_members}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"name": name}).Apply(change, &search_data)

    return 0 
}



func getUserGroups(c *mgo.Collection, user string) ([]model.GroupDataFull, int) {
    var groups []model.GroupDataFull
    var search_data []model.DBGroupData

    count, _ := c.Find(bson.M{"members.name": user}).Count()
    if count == 0 {
        return groups, -1
    }

    err := c.Find(bson.M{"members.name": user}).All(&search_data)
    if err != nil {
        return groups, -1
    }

    for _, group := range search_data {
        var g model.GroupDataFull

        g.Name        = group.Name
        g.Active      = group.Active
        g.CreateDate  = group.CreateDate
        g.Creator     = group.Creator
        g.Description = group.Description
        
        groups = append(groups, g)
    }
    
    return groups, 0
}




func About(w http.ResponseWriter, r *http.Request) {
    test := model.AboutData{"About!"}

    message, err := json.Marshal(test)

    if err != nil {
        panic(err)
    }

    w.Write(message)
}



func Groups(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("groups/[^/]*$")

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
    token := request[2]
    
    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            groups, total := getGroups(db.GetCollection(), r.URL.Query())

            if total < 0 {
                switch ret {
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            return_data := struct {
                Total   int                   `json:"total"`
                Result  []model.GroupDataFull `json:"result"`
            } {
                total,
                groups,
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
            return
    }
}





func Group(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("group/[^/]*/[^/]*$")

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
    name  := request[2]
    token := request[3]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            group, ret := getGroup(db.GetCollection(), name)

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

            json_message, err_json := json.Marshal(group)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
            break
        case "POST":
            var data model.GroupData
            
            err := json.NewDecoder(r.Body).Decode(&data)
            if err != nil {
                w.WriteHeader(http.StatusBadRequest)
                return
            }

            ret := createGroup(db.GetCollection(), name, data)

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
            var data model.GroupData
            
            err := json.NewDecoder(r.Body).Decode(&data)
            if err != nil {
                w.WriteHeader(http.StatusBadRequest)
                return
            }

            ret := updateGroup(db.GetCollection(), name, data)

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
            ret := deleteGroup(db.GetCollection(), name)

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
    return
}







func Members(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("members/[^/]*/[^/]*/[^/]*$")

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
    action  := request[2]
    name    := request[3]
    token   := request[4]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            if action != "get" {
                w.WriteHeader(http.StatusBadRequest)
                return
            }
            
            members, ret := getMembers(db.GetCollection(), name)

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

            json_message, err_json := json.Marshal(members)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
            break
        case "POST":
            var data []string
            
            err := json.NewDecoder(r.Body).Decode(&data)
            if err != nil {
                w.WriteHeader(http.StatusBadRequest)
                return
            }

            var ret int
            
            switch action {
                case "add":
                    ret = addMembers(db.GetCollection(), name, data)
                    break
                case "remove":
                    ret = removeMembers(db.GetCollection(), name, data)
                    break
                default:
                    w.WriteHeader(http.StatusBadRequest)
                    return
            }

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

            w.WriteHeader(http.StatusOK)
            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}






func User(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("user/[^/]*/groups/[^/]*$")

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
    user    := request[2]
    token   := request[4]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            groups, ret := getUserGroups(db.GetCollection(), user)

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

            json_message, err_json := json.Marshal(groups)
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

