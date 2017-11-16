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
    "../libs"
    "../db"
)


func checkUserExists(c *mgo.Collection, login string) (bool) {
    count, err := c.Find(bson.M{"login": login}).Count()

    if err != nil {
        panic(err)
    }

    if count > 0 {
        return true
    }
    
    return false
}



func getUserByLogin(c *mgo.Collection, login string) (model.DBUserData, int) {
    var user model.DBUserData

    exists := checkUserExists(c, login)
    if exists != true {
        return user, -1
    }

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

    exists := checkUserExists(c, user.Login)
    if len(user.Login) < 1 || exists != true {
        return user, -1
    }

    current_time := libs.CurrentTime()
    
    if len(user.ExpirationTime) < 1 || libs.CompareDates(current_time, user.ExpirationTime) {
        return user, 1
    }

    return user, 0
}


func getUsers(c *mgo.Collection, params map[string][]string, token string) ([]model.BasicUserData, int) {
    var search_data []model.DBUserData
    var users []model.BasicUserData

    find_by := bson.M{}
    sort_by := "lastname, firstname, login"
    limit := -1
    offset := 0
    
    if value, ok := params["limit"]; ok {
        m_limit, err := strconv.Atoi(value[0])
        if (err != nil ) {
            return users, -1
        }
        limit = m_limit
    }

    if value, ok := params["offset"]; ok {
        m_offset, err := strconv.Atoi(value[0])
        if (err != nil ) {
            return users, -1
        }
        offset = m_offset
    }

    if value, ok := params["search"]; ok {
        find_by = bson.M{"$or":[]bson.M{
                bson.M{"login":bson.RegEx{".*" + value[0] + ".*", ""}},
                bson.M{"firstname":bson.RegEx{".*" + value[0] + ".*", ""}},
                bson.M{"lastname":bson.RegEx{".*" + value[0] + ".*", ""}},
                bson.M{"email":bson.RegEx{".*" + value[0] + ".*", ""}}}}
    }
    
    total, _ := c.Find(find_by).Count()
    
    if limit < 0 {
        limit = total
    }

    c.Find(find_by).Sort(sort_by).Skip(offset).Limit(limit).All(&search_data)

    for _, u := range search_data {
        var user model.BasicUserData

        user.Type                = u.Type
        user.Active              = u.Active
        user.Login               = u.Login
        user.FirstName           = u.FirstName
        user.LastName            = u.LastName
        user.Email               = u.Email
        user.LastLogin           = u.LastLogin
        user.LastActive          = u.LastActive
        user.TokenExpirationTime = u.ExpirationTime

        users = append(users, user)
    }

    return users, total
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



func About(w http.ResponseWriter, r *http.Request) {
    test := model.AboutData{"About!"}

    message, err := json.Marshal(test)

    if err != nil {
        panic(err)
    }

    w.Write(message)
}


func Users(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("users/[^/]*$")

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
    
    _, ret := getUserByToken(db.GetCollection(), token)

    if ret != 0 {
        switch ret {
            case 1:
                w.WriteHeader(http.StatusForbidden)
                break
            default:
                w.WriteHeader(http.StatusInternalServerError)
                break
        }
        return
    }

    switch r.Method {
        case "GET":
            users, total := getUsers(db.GetCollection(), r.URL.Query(), token)

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
                Result  []model.BasicUserData `json:"result"`
            } {
                total,
                users,
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

            user, ret := getUserData(db.GetCollection(), login, token)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusForbidden)
                        break
                    case -2:
                        w.WriteHeader(http.StatusNotFound)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            json_message, err_json := json.Marshal(user)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
            break
        case "POST":
            request := strings.Split(r.URL.Path, "/")
            token := request[3]

            var user_data model.NewUserData
            
            err := json.NewDecoder(r.Body).Decode(&user_data)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            ret := createUser(db.GetCollection(), token, user_data)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusForbidden)
                        break
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
            request := strings.Split(r.URL.Path, "/")
            login := request[2]
            token := request[3]

            var user_data model.UpdateUserData
            
            err := json.NewDecoder(r.Body).Decode(&user_data)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            ret := updateUser(db.GetCollection(), login, token, user_data)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusForbidden)
                        break
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
            request := strings.Split(r.URL.Path, "/")
            login := request[2]
            token := request[3]

            ret := deleteUser(db.GetCollection(), login, token)

            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusForbidden)
                        break
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
                return
            }

            token_data, ret := loginUser(db.GetCollection(), login, passwd_data)
            
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
            break
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

            ret := logoutUser(db.GetCollection(), token)
            
            if ret != 0 {
                w.WriteHeader(http.StatusForbidden)
                return
            }

            w.WriteHeader(http.StatusOK)
            break
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
                return
            }

            ret := changeUserPasswd(db.GetCollection(), login, token, passwd_data)
            
            if ret != 0 {
                switch ret {
                    case -1:
                        w.WriteHeader(http.StatusForbidden)
                        break
                    case -2:
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
            return
    }
}



func Verify(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("verify/[^/]*$")

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

            user_data, ret := getUserByToken(db.GetCollection(), token)

            if ret != 0 {
                switch ret {
                    case 1:
                        w.WriteHeader(http.StatusForbidden)
                        break
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }
            
            var verify_data model.VerifyData
            verify_data.Login = user_data.Login
            
            json_message, err_json := json.Marshal(verify_data)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)

            w.WriteHeader(http.StatusOK)
            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }
}
