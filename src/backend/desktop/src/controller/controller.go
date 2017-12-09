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



func About(w http.ResponseWriter, r *http.Request) {
    test := model.AboutData{"Version: 0.3"}

    message, err := json.Marshal(test)

    if err != nil {
        panic(err)
    }

    w.Write(message)
}


func Documents(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("documents/[^/]*$")
/*
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
    }*/
}



func Actions(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("actions/[^/]*$")
/*
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
    }*/
}


func Comments(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("comments/[^/]*$")
/*
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
    }*/
}
