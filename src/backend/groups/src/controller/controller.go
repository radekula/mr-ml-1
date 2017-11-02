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
    "../libs"
)


func getGroups(c *mgo.Collection) ([]model.DBGroupData, int) {
    var groups []model.DBGroupData

    collection.Find(bson.M{}).All(&groups)

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

    config := config.GetConfig()

    switch r.Method {
        case "GET":
            request := strings.Split(r.URL.Path, "/")
            token := request[2]

            userData, ret := VerifyToken(token)
            if ret != 200 {
                w.WriteHeader(http.StatusForbidden)
                return
            }

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



func getUserData(c *mgo.Collection, login string, token string) (model.BasicUserData, int) {
    var ret_user model.BasicUserData

    user, err := getUserByToken(c, token)

    if err != 0 {
        return ret_user, -1
    }

    search_user, ret := getUserByLogin(c, login)

    if user.Type != "admin" {
        if ret != 0 || search_user.Token != token {
            return ret_user, -1
        }
    }
    
    if ret != 0 {
        return ret_user, -2
    }

    ret_user.Type = search_user.Type
    ret_user.Active = search_user.Active
    ret_user.Login = search_user.Login
    ret_user.FirstName = search_user.FirstName
    ret_user.LastName = search_user.LastName
    ret_user.Email = search_user.Email
    ret_user.LastLogin = search_user.LastLogin
    ret_user.LastActive = search_user.LastActive
    ret_user.TokenExpirationTime = search_user.ExpirationTime
       
    return ret_user, 0
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


func updateUser(c *mgo.Collection, login string, token string, user_data model.UpdateUserData) (int) {
    user, err := getUserByToken(c, token)

    if err != 0 {
        return -1
    }

    org_user, err := getUserByLogin(c, login)

    if user.Type != "admin" {
        if org_user.Token != token {
            return -1
        }
    }
    
    if err != 0 {
        return 1
    }

    if len(user_data.Type) > 1      {org_user.Type = user_data.Type}
    if user_data.Active             {org_user.Active = user_data.Active}
    if len(user_data.FirstName) > 1 {org_user.FirstName = user_data.FirstName}
    if len(user_data.LastName) > 1  {org_user.LastName = user_data.LastName}
    if len(user_data.Email) > 1     {org_user.Email = user_data.Email}

    data_change := bson.M{"type"         : org_user.Type, 
                          "active"       : org_user.Active,
                          "firstname"    : org_user.FirstName,
                          "lastname"     : org_user.LastName,
                          "email"        : org_user.Email}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"login": login}).Apply(change, &org_user)

    return 0
}



func deleteUser(c *mgo.Collection, login string, token string) (int) {
    user, err := getUserByToken(c, token)

    if err != 0 {
        return -1
    }

    org_user, err := getUserByLogin(c, login)

    if user.Type != "admin" {
        if org_user.Token != token {
            return -1
        }
    }
    
    if err != 0 {
        return 1
    }

    c.Remove(bson.M{"login": login})

    return 0
}


func loginUser(c *mgo.Collection, login string, passwd_data model.LoginData) (model.TokenData, int) {
    var token model.TokenData
    
    exists := checkUserExists(c, login)
    
    if !exists {
        return token, -1
    }

    user, err := getUserByLogin(c, login)

    if err != 0 {
        return token, -2
    }

    valid := libs.ComparePasswd(passwd_data.Password, user.Password)
    if !valid {
        return token, 1
    }

    curr_time := libs.CurrentTime()

    expired := false
    
    if len(user.ExpirationTime) > 1 {
        expired = libs.CompareDates(curr_time, user.ExpirationTime)
    }

    if expired || len(user.Token) < 1 {
        token.Token = libs.NewToken()
    } else {
        token.Token = user.Token
    }

    token.ExpirationTime = libs.CalculateExpirationTime(3600)

    data_change := bson.M{"token"          : token.Token, 
                          "expirationtime" : token.ExpirationTime,
                          "lastlogin"      : curr_time,
                          "lastactive"     : curr_time}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"login": login}).Apply(change, &user)

    return token, 0
}



func logoutUser(c *mgo.Collection, token string) (int) {    
    user, exists := getUserByToken(c, token)
    
    if exists != 0 {
        return -1
    }

    curr_time := libs.CurrentTime()

    data_change := bson.M{"token"          : "", 
                          "expirationtime" : "",
                          "lastactive"     : curr_time}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"login": user.Login}).Apply(change, &user)

    return 0
}



func changeUserPasswd(c *mgo.Collection, login string, token string, passwd_data model.PasswordChangeData) (int) {
    user, err := getUserByToken(c, token)

    if err != 0 {
        return -1
    }

    if user.Type != "admin" {
        if user.Token != token {
            return -1
        }

        if libs.ComparePasswd(passwd_data.OldPassword, user.Password) {
            return -1
        }
    } else {
        if user.Token != token {
            exists := checkUserExists(c, login)
        
            if !exists {
                return -2
            }
        }
    }

    dest_user, ret := getUserByLogin(c, login)
    if ret != 0 {
        return -2
    }

    data_change := bson.M{"password": libs.HashPasswd(passwd_data.NewPassword)}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"login": dest_user.Login}).Apply(change, &dest_user)
    return 0
}







func User(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("user/[^/]*/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    switch r.Method {
        case "GET":
            request := strings.Split(r.URL.Path, "/")
            login := request[2]
            token := request[3]

            session, err := mgo.Dial("users-database-mongo")

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("usersDatabase").C("users")
            user, ret := getUserData(collection, login, token)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusForbidden)
                    case -2:
                        w.WriteHeader(http.StatusNotFound)
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                }
                return
            }

            json_message, err_json := json.Marshal(user)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
        case "POST":
            request := strings.Split(r.URL.Path, "/")
            token := request[3]

            var user_data model.NewUserData
            
            err := json.NewDecoder(r.Body).Decode(&user_data)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }
            
            session, err := mgo.Dial("users-database-mongo")

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("usersDatabase").C("users")
            ret := createUser(collection, token, user_data)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusForbidden)
                    case 1:
                        w.WriteHeader(http.StatusConflict)
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                }
                return
            }

            w.WriteHeader(http.StatusOK)
        case "PUT":
            request := strings.Split(r.URL.Path, "/")
            login := request[2]
            token := request[3]

            var user_data model.UpdateUserData
            
            err := json.NewDecoder(r.Body).Decode(&user_data)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }
            
            session, err := mgo.Dial("users-database-mongo")

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("usersDatabase").C("users")
            ret := updateUser(collection, login, token, user_data)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusForbidden)
                    case 1:
                        w.WriteHeader(http.StatusNotFound)
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                }
                return
            }

            w.WriteHeader(http.StatusOK)
        case "DELETE":
            request := strings.Split(r.URL.Path, "/")
            login := request[2]
            token := request[3]
            
            session, err := mgo.Dial("users-database-mongo")

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("usersDatabase").C("users")
            ret := deleteUser(collection, login, token)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusForbidden)
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



func Login(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("login/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    switch r.Method {
        case "POST":
            request := strings.Split(r.URL.Path, "/")
            login := request[2]

            var passwd_data model.LoginData

            err := json.NewDecoder(r.Body).Decode(&passwd_data)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }

            session, err := mgo.Dial("users-database-mongo")

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("usersDatabase").C("users")
            token_data, ret := loginUser(collection, login, passwd_data)
            
            if ret != 0 {
                w.WriteHeader(http.StatusForbidden)
                return
            }

            json_message, err_json := json.Marshal(token_data)
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


func Logout(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("logout/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    switch r.Method {
        case "GET":
            request := strings.Split(r.URL.Path, "/")
            token := request[2]

            session, err := mgo.Dial("users-database-mongo")

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("usersDatabase").C("users")
            ret := logoutUser(collection, token)
            
            if ret != 0 {
                w.WriteHeader(http.StatusForbidden)
                return
            }

            w.WriteHeader(http.StatusOK)
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }
}



func ChangePassword(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("change_password/[^/]*/[^/]*$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    switch r.Method {
        case "POST":
            request := strings.Split(r.URL.Path, "/")
            login := request[2]
            token := request[3]

            var passwd_data model.PasswordChangeData

            err := json.NewDecoder(r.Body).Decode(&passwd_data)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }

            session, err := mgo.Dial("users-database-mongo")

            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            defer session.Close()

            collection := session.DB("usersDatabase").C("users")
            ret := changeUserPasswd(collection, login, token, passwd_data)
            
            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusForbidden)
                    case -2:
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
*/
