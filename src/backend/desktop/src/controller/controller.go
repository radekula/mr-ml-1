package controller


import (
    "strings"
    "encoding/json"
    "net/http"
    "regexp"
    "../model"
    "../remote"
    "fmt"
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

    user, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            documents := remote.GetUserDocuments(user.Login, token, r.URL.Query())

            if documents.Total < 0 {
                switch ret {
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            json_message, err_json := json.Marshal(documents)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
            break
        default:
            fmt.Println("Bad request")
            w.WriteHeader(http.StatusBadRequest)
            return
    }
}



func Actions(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("actions/[^/]*$")

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

    user, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            actions := remote.GetUserActions(user.Login, token, r.URL.Query())

            if actions.Total < 0 {
                switch ret {
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            json_message, err_json := json.Marshal(actions)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
            break
        default:
            fmt.Println("Bad request")
            w.WriteHeader(http.StatusBadRequest)
            return
    }
}


func Comments(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("comments/[^/]*$")

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

    user, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            comments := remote.GetUserComments(user.Login, token, r.URL.Query())

            if comments.Total < 0 {
                switch ret {
                    default:
                        w.WriteHeader(http.StatusInternalServerError)
                        break
                }
                return
            }

            json_message, err_json := json.Marshal(comments)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
            break
        default:
            fmt.Println("Bad request")
            w.WriteHeader(http.StatusBadRequest)
            return
    }
}
