package controller


import (
//    "fmt"
    "strings"
    "encoding/json"
    "net/http"
    "regexp"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
    "../model"
    "../config"
    "../remote"
)


func getGroups(collection *mgo.Collection) ([]model.DBGroupData, int) {
    var groups []model.DBGroupData

    collection.Find(bson.M{}).All(&groups)

    return groups, 0
}

func getGroup(c *mgo.Collection, name string) (model.GroupDataFull, int) {
    var ret_data model.GroupDataFull

    var search_data model.DBGroupData

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
            
    config := config.GetConfig()

    switch r.Method {
        case "GET":
            session, err := mgo.Dial(config.Service.Database)

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("groupsDatabase").C("groups")
            groups, ret := getGroups(collection)

            if ret != 0 {
                switch ret {
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                }
                return
            }

            json_message, err_json := json.Marshal(groups)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)

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

    config := config.GetConfig()

    switch r.Method {
        case "GET":
            session, err := mgo.Dial(config.Service.Database)

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("groupsDatabase").C("groups")
            group, ret := getGroup(collection, name)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusNotFound)
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                }
                return
            }

            json_message, err_json := json.Marshal(group)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
        case "POST":
            var data model.GroupData
            
            err := json.NewDecoder(r.Body).Decode(&data)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }
            
            session, err := mgo.Dial(config.Service.Database)

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("groupsDatabase").C("groups")
            ret := createGroup(collection, name, data)

            if ret != 0 {
                switch ret {
                    case 1:
                        w.WriteHeader(http.StatusConflict)
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                }
                return
            }

            w.WriteHeader(http.StatusOK)
        case "PUT":
            var data model.GroupData
            
            err := json.NewDecoder(r.Body).Decode(&data)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }
            
            session, err := mgo.Dial(config.Service.Database)

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("groupsDatabase").C("groups")
            ret := updateGroup(collection, name, data)

            if ret != 0 {
                switch ret {
                    case 1:
                        w.WriteHeader(http.StatusNotFound)
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                }
                return
            }

            w.WriteHeader(http.StatusOK)
        case "DELETE":
            session, err := mgo.Dial(config.Service.Database)

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("groupsDatabase").C("groups")
            ret := deleteGroup(collection, name)

            if ret != 0 {
                switch ret {
                    case 1:
                        w.WriteHeader(http.StatusNotFound)
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                }
                return
            }

            w.WriteHeader(http.StatusOK)
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }
}


















/*
func getUserByLogin(c *mgo.Collection, login string) (model.DBUserData, int) {
    var user model.DBUserData
    
    err := c.Find(bson.M{"login": login}).One(&user)
    if err != nil {
        return user, 1
    }

    return user, 0
}


func getUserByToken(c *mgo.Collection, token string) (model.DBUserData, int) {
    var user model.DBUserData
    
    err := c.Find(bson.M{"token": token}).One(&user)
    if err != nil {
        return user, 1
    }

    current_time := libs.CurrentTime()
    
    if len(user.ExpirationTime) < 1 || libs.CompareDates(current_time, user.ExpirationTime) {
        return user, 1
    }

    return user, 0
}




func createUser(c *mgo.Collection, token string, user_data model.NewUserData) (int) {
    user, err := getUserByToken(c, token)

    if err != 0 {
        return -1
    }

    if user.Type != "admin" {
        return -1
    }

    _, err = getUserByLogin(c, user_data.Login)
    
    if err == 0 {
        return 1
    }

    var new_user model.DBUserData

    new_user.Type = user_data.Type
    new_user.Active = user_data.Active
    new_user.Login = user_data.Login
    new_user.FirstName = user_data.FirstName
    new_user.LastName = user_data.LastName
    new_user.Email = user_data.Email
    new_user.Password = libs.HashPasswd(user_data.Password)

    c.Insert(&new_user)
    
    return 0;
}


*/
