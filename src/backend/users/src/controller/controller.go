package controller


import (
//    "fmt"
//    "strings"
    "encoding/json"
    "net/http"
//    "regexp"
//    "gopkg.in/mgo.v2"
//    "gopkg.in/mgo.v2/bson"
    "../model"
)



func About(w http.ResponseWriter, r *http.Request) {
    test := model.AboutData{"About!"}

    message, err := json.Marshal(test)

    if err != nil {
        panic(err)
    }

    w.Write(message)
}



func User(w http.ResponseWriter, r *http.Request) {
/*    re, err := regexp.CompilePOSIX("documents/[^/]*$")

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
            documents, err := get_documents()

            if err != 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            json_message, err_json := json.Marshal(documents)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Header().Set("Access-Control-Allow-Origin", "*")
            w.Header().Add("Access-Control-Allow-Headers", "Content-Type")
            w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
            w.Write(json_message)
        case "POST":
            // Search documents.
            w.WriteHeader(http.StatusBadRequest)
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }*/
}



func Login(w http.ResponseWriter, r *http.Request) {
/*    re, err := regexp.CompilePOSIX("documents/[^/]*$")

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
            documents, err := get_documents()

            if err != 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            json_message, err_json := json.Marshal(documents)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Header().Set("Access-Control-Allow-Origin", "*")
            w.Header().Add("Access-Control-Allow-Headers", "Content-Type")
            w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
            w.Write(json_message)
        case "POST":
            // Search documents.
            w.WriteHeader(http.StatusBadRequest)
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }*/
}


func Logout(w http.ResponseWriter, r *http.Request) {
/*    re, err := regexp.CompilePOSIX("documents/[^/]*$")

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
            documents, err := get_documents()

            if err != 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            json_message, err_json := json.Marshal(documents)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Header().Set("Access-Control-Allow-Origin", "*")
            w.Header().Add("Access-Control-Allow-Headers", "Content-Type")
            w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
            w.Write(json_message)
        case "POST":
            // Search documents.
            w.WriteHeader(http.StatusBadRequest)
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }*/
}



func ChangePassword(w http.ResponseWriter, r *http.Request) {
/*    re, err := regexp.CompilePOSIX("documents/[^/]*$")

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
            documents, err := get_documents()

            if err != 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            json_message, err_json := json.Marshal(documents)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Header().Set("Access-Control-Allow-Origin", "*")
            w.Header().Add("Access-Control-Allow-Headers", "Content-Type")
            w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
            w.Write(json_message)
        case "POST":
            // Search documents.
            w.WriteHeader(http.StatusBadRequest)
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }*/
}
