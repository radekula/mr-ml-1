package main

import (
    "encoding/json"
    "net/http"
    "regexp"
)


type DocumentMetadata struct {
    Name string `json:"name"`
    Value string `json:"value"`
}


type DocumentData struct {
    Id string `json:"id"`
    Title string `json:"title"`
    FileName string `json:"file_name"`
    CreateDate string `json:"create_date"`
    Description string `json:"description"`
    Owner []string `json:"owner"`
    Metadata []DocumentMetadata `json:"metadata"`
    Thumbnail string `json:"thumbnail"`
    Data string `json:"data"`
}


type SimpleMessage struct {
    Code int
    Text string
}


func get_document(id string) (DocumentData, int) {
    doc := DocumentData{}
    
    doc.Id = "id"
    doc.Title = "title"
    doc.FileName = "file_name"
    doc.CreateDate = "2017-05-05"
    doc.Description = "description"
    doc.Owner = append(doc.Owner, "owner1")
    doc.Owner = append(doc.Owner, "owner2")
    doc.Metadata = append(doc.Metadata, DocumentMetadata{"meta1", "value1"})
    doc.Metadata = append(doc.Metadata, DocumentMetadata{"meta2", "value2"})
    doc.Thumbnail = "thumbnail"
    doc.Data = "data"
    
    return doc, 0
}

func about(w http.ResponseWriter, r *http.Request) {
    test := SimpleMessage{200, "About!"}
    
    message, err := json.Marshal(test)

    if err != nil {
        panic(err)
    }

    w.Write(message)
}
 
func document(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("document/[^/]+/{0,1}$")

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
            doc, err := get_document("das")
            if err != 0 {
                if err < 0 {
                    w.WriteHeader(http.StatusInternalServerError)
                    return
                } else {
                    w.WriteHeader(http.StatusNotFound)
                    return
                }
            }
            json_message, err_json := json.Marshal(doc)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
        case "POST":
            // Create a new record.
            w.WriteHeader(http.StatusBadRequest)
        case "PUT":
            // Update an existing record.
            w.WriteHeader(http.StatusBadRequest)
        case "DELETE":
            // Remove the record.
            w.WriteHeader(http.StatusBadRequest)
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }
}

func documents(w http.ResponseWriter, r *http.Request) {
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

    switch r.Method {
        case "GET":
            var documents []DocumentData
            
            doc, err := get_document("das")
            if err != 0 {
                if err < 0 {
                    w.WriteHeader(http.StatusInternalServerError)
                    return
                } else {
                    w.WriteHeader(http.StatusNotFound)
                    return
                }
            }
            documents = append(documents, doc)
            documents = append(documents, doc)

            json_message, err_json := json.Marshal(documents)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
        case "POST":
            // Create a new record.
            w.WriteHeader(http.StatusBadRequest)
        case "PUT":
            // Update an existing record.
            w.WriteHeader(http.StatusBadRequest)
        case "DELETE":
            // Remove the record.
            w.WriteHeader(http.StatusBadRequest)
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }
}


func main() {
    http.HandleFunc("/", about)
    http.HandleFunc("/document/", document)
    http.HandleFunc("/documents/", documents)
    http.ListenAndServe(":8080", nil)
}
