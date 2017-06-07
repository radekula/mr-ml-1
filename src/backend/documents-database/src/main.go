package main

import (
    "fmt"
    "strings"
    "encoding/json"
    "net/http"
    "regexp"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
)




type DocumentMetadata struct {
    Name string `json:"name"`
    Value string `json:"value"`
}




type DocumentData struct {
    Id string `json:"id" bson:"id,omitempty"`
    Title string `json:"title" bson:"title,omitempty"`
    FileName string `json:"file_name" bson:"file_name,omitempty"`
    CreateDate string `json:"create_date" bson:"create_date,omitempty"`
    Description string `json:"description" bson:"description,omitempty"`
    Owner []string `json:"owner" bson:"owner,omitempty"`
    Metadata []DocumentMetadata `json:"metadata" bson:"metadata,omitempty"`
    Thumbnail string `json:"thumbnail" bson:"thumbnail,omitempty"`
    Data string `json:"data" bson:"data,omitempty"`
}




type DocumentDataLite struct {
    Id string `json:"id" bson:"id,omitempty"`
    Title string `json:"title" bson:"title,omitempty"`
    FileName string `json:"file_name" bson:"file_name,omitempty""`
    CreateDate string `json:"create_date" bson:"create_date,omitempty"`
    Description string `json:"description" bson:"description,omitempty"`
    Owner []string `json:"owner" bson:"owner,omitempty"`
    Metadata []DocumentMetadata `json:"metadata" bson:"metadata,omitempty"`
}




type SimpleMessage struct {
    Code int
    Text string
}




func get_documents() ([]DocumentDataLite, int) {
    session, err := mgo.Dial("documents-database-mongo")
    if err != nil {
        panic(err)
    }
    defer session.Close()

    var documents []DocumentDataLite;

    collection := session.DB("documentsDatabase").C("documents")
    collection.Find(bson.M{}).All(&documents)

    return documents, 0
}


func get_document(id string) (DocumentData, int) {
    session, err := mgo.Dial("documents-database-mongo")
    if err != nil {
        panic(err)
    }
    defer session.Close()

    var document DocumentData;

    collection := session.DB("documentsDatabase").C("documents")
    collection.Find(bson.M{"id": id}).One(&document)

    return document, 0
}



func write_document(document DocumentData) (int) {
    session, err := mgo.Dial("documents-database-mongo")
    if err != nil {
        panic(err)
        return 1
    }
    defer session.Close()
   
    collection := session.DB("documentsDatabase").C("documents")
    collection.Insert(&document)

    return 0
}



func update_document(document DocumentData) (int) {
    session, err := mgo.Dial("documents-database-mongo")
    if err != nil {
        panic(err)
        return 1
    }
    defer session.Close()
   
    collection := session.DB("documentsDatabase").C("documents")

    change := mgo.Change{
        Update: bson.M{"$set": document},
        ReturnNew: false,
    }

    collection.Find(bson.M{"id": document.Id}).Apply(change, &document)

    return 0
}




func delete_document(id string) (int) {
    session, err := mgo.Dial("documents-database-mongo")
    if err != nil {
        panic(err)
        return 1
    }
    defer session.Close()
   
    collection := session.DB("documentsDatabase").C("documents")

    collection.Remove(bson.M{"id": id})

    return 0
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

    request := strings.Split(r.URL.Path, "/");

    switch r.Method {
        case "GET":
            doc, err := get_document(request[2])
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
            fmt.Println("Document returned");
        case "POST":
            var document DocumentData

            err := json.NewDecoder(r.Body).Decode(&document)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }

            document.Id = request[2];
            if(write_document(document) > 0) {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            fmt.Println("New document added");
        case "PUT":
            var document DocumentData

            err := json.NewDecoder(r.Body).Decode(&document)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }

            document.Id = request[2];
            if(update_document(document) > 0) {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            fmt.Println("Document modified");
        case "DELETE":
            id := request[2];
            if(delete_document(id) > 0) {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            fmt.Println("Document removed");
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
            w.Write(json_message)
        case "POST":
            // Search documents.
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
    
    fmt.Println("Service started.")
    http.ListenAndServe(":8080", nil)
}
