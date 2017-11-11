package controller


import (
    "strings"
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



func getDocuments(c *mgo.Collection) ([]model.DocumentLite, int) {
    var search_data []model.DBDocument
    var documents []model.DocumentLite

    c.Find(bson.M{}).All(&search_data)

    for _, d := range search_data {
        var doc model.DocumentLite
        
        doc.Id          = d.Id
        doc.Title       = d.Title
        doc.FileName    = d.FileName
        doc.CreateDate  = d.CreateDate
        doc.Description = d.Description
        doc.Owner       = d.Owner
        doc.Metadata    = d.Metadata
        
        documents = append(documents, doc)
    }
    
    return documents, 0
}


func getDocument(c *mgo.Collection, id string) (model.Document, int) {
    var document model.Document
    var search_data model.DBDocument

    count, _ := c.Find(bson.M{"id": id}).Count()
    if count != 1 {
        return document, 1
    }

    err := c.Find(bson.M{"id": id}).One(&search_data)
    if err != nil {
        return document, -1
    }

    document.Id          = search_data.Id
    document.Title       = search_data.Title
    document.FileName    = search_data.FileName
    document.CreateDate  = search_data.CreateDate
    document.Description = search_data.Description
    document.Owner       = search_data.Owner
    document.Metadata    = search_data.Metadata
    document.Thumbnail   = search_data.Thumbnail
    document.Data        = search_data.Data

    return document, 0
}



func writeDocument(c *mgo.Collection, document model.Document) (model.DocumentId, int) {
    var add_data model.DBDocument
    var doc_id model.DocumentId

    if document.Id != "generate" {
        count, _ := c.Find(bson.M{"id": document.Id}).Count()
        if count != 1 {
            return doc_id, 1
        }
    }

    add_data.Id          = document.Id
    add_data.Title       = document.Title
    add_data.FileName    = document.FileName
    add_data.CreateDate  = document.CreateDate
    add_data.Description = document.Description
    add_data.Owner       = document.Owner
    add_data.Metadata    = document.Metadata
    add_data.Thumbnail   = document.Thumbnail
    add_data.Data        = document.Data
    
    if add_data.Id == "generate" {
        add_data.Id = uuid.NewV4().String()
        doc_id.Id = add_data.Id
    }

    c.Insert(&add_data)

    return doc_id, 0
}




func updateDocument(c *mgo.Collection, data model.Document) (int) {
    org_data, err := getDocument(c, data.Id)
    
    if err != 0 {
        return 1
    }

    if len(data.Title) > 0             {org_data.Title = data.Title}
    if len(data.FileName) > 0          {org_data.FileName = data.FileName}
    if len(data.CreateDate) > 0        {org_data.CreateDate = data.CreateDate}
    if len(data.Description) > 0       {org_data.Description = data.Description}
    if len(data.Data) > 0              {org_data.Data = data.Data}
    if len(data.Thumbnail) > 0         {org_data.Thumbnail = data.Thumbnail}
    org_data.Owner = data.Owner
    org_data.Metadata = data.Metadata

    data_change := bson.M{"title"        : org_data.Title, 
                          "file_name"    : org_data.FileName,
                          "create_date"  : org_data.CreateDate,
                          "description"  : org_data.Description,
                          "data"         : org_data.Data,
                          "thumbnail"    : org_data.Thumbnail,
                          "owner"        : org_data.Owner,
                          "metadata"     : org_data.Metadata}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"id": data.Id}).Apply(change, &org_data)

    return 0
}




func deleteDocument(c *mgo.Collection, id string) (int) {
    count, _ := c.Find(bson.M{"id": id}).Count()
    if count != 1 {
        return 1
    }

    c.Remove(bson.M{"id": id})

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


 
func Document(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("document/[^/]+/[^/]+$")

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
    id      := request[2]
    token   := request[3]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            doc, err := getDocument(db.GetCollection(), id)
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
            break
        case "POST":
            var document model.Document

            err := json.NewDecoder(r.Body).Decode(&document)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }

            document.Id = id;
            
            doc_id, ret := writeDocument(db.GetCollection(), document)
            if ret > 0 {
                w.WriteHeader(http.StatusConflict)
                return
            }
            
            json_message, err_json := json.Marshal(doc_id)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }
            w.Write(json_message)
            break
        case "PUT":
            var document model.Document

            err := json.NewDecoder(r.Body).Decode(&document)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }

            document.Id = id
            if updateDocument(db.GetCollection(), document) > 0 {
                w.WriteHeader(http.StatusNotFound)
                return
            }

            break
        case "DELETE":
            if deleteDocument(db.GetCollection(), id) > 0 {
                w.WriteHeader(http.StatusNotFound)
                return
            }

            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }
}



func Documents(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("documents/[^/]+$")

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
    token   := request[2]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            documents, err := getDocuments(db.GetCollection())

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
            break
        case "POST":
            // Search documents.
            w.WriteHeader(http.StatusBadRequest)
            break
        default:
            w.WriteHeader(http.StatusBadRequest)
            return
    }
}

