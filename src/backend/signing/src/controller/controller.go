package controller


import (
    "strings"
    "encoding/json"
    "net/http"
    "regexp"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
    "../model"
    "../remote"
    "../db"
    "../libs"
    "fmt"
    "encoding/base64"
    "crypto/rsa"
    "crypto/rand"
    "crypto/sha256"
    "crypto"
)



func calculateSignature(document model.Document, PrivateKey rsa.PrivateKey) (string, int) {
    var signature []byte

    data, err := base64.StdEncoding.DecodeString(document.Data)
    if err != nil {
        return string(signature), -1
    }

    rng := rand.Reader
    hashed := sha256.Sum256(data)

    signature, err2 := rsa.SignPKCS1v15(rng, &PrivateKey, crypto.SHA256, hashed[:])
    if err2 != nil {
        return string(signature), -1
    }

    return string(signature), 0
}


func verifySignature(document model.Document, signature string, PublicKey rsa.PublicKey) (int) {
    data, err := base64.StdEncoding.DecodeString(document.Data)
    if err != nil {
        return -1
    }

    hashed := sha256.Sum256(data)

    err2 := rsa.VerifyPKCS1v15(&PublicKey, crypto.SHA256, hashed[:], []byte(signature))
    if err2 != nil {
        return 1
    }

    return 0
}



func getKey(c *mgo.Collection, login string) (model.PublicKeyData, int) {
    var ret_data model.PublicKeyData

    var search_data model.DBKeysData

    count, _ := c.Find(bson.M{"login": login}).Count()
    if count != 1 {
        return ret_data, 1
    }

    err := c.Find(bson.M{"login": login}).One(&search_data)
    if err != nil {
        return ret_data, 1
    }

    ret_data.PublicKey = search_data.PublicKey

    return ret_data, 0
}



func updateKeys(c *mgo.Collection, login string, data model.NewKeysData) (int) {
    var db_data model.DBKeysData

    count, _ := c.Find(bson.M{"login": login}).Count()

    if count > 0 {
        err := c.Find(bson.M{"login": login}).One(&db_data)
        if err != nil {
            return -1
        }

        if len(data.PrivateKey) > 1     {db_data.PrivateKey = data.PrivateKey}
        if len(data.PublicKey) > 1      {db_data.PublicKey = data.PublicKey}

        data_change := bson.M{"private_key"         : db_data.PrivateKey, 
                              "public_key"          : db_data.PublicKey}

        change := mgo.Change{
            Update:  bson.M{"$set": data_change},
            ReturnNew: false,
        }

        c.Find(bson.M{"login": login}).Apply(change, &data_change)
    } else {
        db_data.Login      = login
        db_data.PrivateKey = data.PrivateKey
        db_data.PublicKey  = data.PublicKey

        c.Insert(&db_data)
    }

    return 0
}



func getSignatures(c *mgo.Collection, document string) ([]model.SignatureData, int) {
    var search_data model.DBDocumentData
    var signatures []model.SignatureData

    count, err := c.Find(bson.M{"id": document}).Count()
    if err != nil {
        return signatures, -1
    }

    if count == 0 {
        return signatures, 1
    }

    c.Find(bson.M{"id": document}).One(&search_data)

    for _, s := range search_data.Signatures {
        var signature model.SignatureData

        signature.Login          = s.Login
        signature.SignDate       = s.SignDate
        signature.Signature      = s.Signature

        signatures = append(signatures, signature)
    }

    return signatures, 0
}


func sign(c *mgo.Collection, document string, login string, token string) (int) {
    var signatures model.DBDocumentData
    
    count, err := c.Find(bson.M{"id": document}).Count()
    if err != nil {
        return -1
    }

    if count > 0 {
        // there are some signatures so we need to get them
        err := c.Find(bson.M{"id": document}).One(&signatures)
        if err != nil {
            return -1
        }

        var new_signatures []model.DBSignData

        // search and remove (skip) old user signature
        for _, sign := range signatures.Signatures {
            if sign.Login != login {
                new_signatures = append(new_signatures, sign)
            }
        }

        var signature model.DBSignData

        signature.Login = login
        signature.SignDate = libs.CurrentTime()
//        signature.Signature = nil
//        signature.Checksum = nil

        new_signatures = append(new_signatures, signature)

        data_change := bson.M{"signatures" : new_signatures}

        change := mgo.Change{
            Update:  bson.M{"$set": data_change},
            ReturnNew: false,
        }

        c.Find(bson.M{"login": login}).Apply(change, &signatures)
    } else {
        // first signature
        var signature model.DBSignData

        signature.Login = login
        signature.SignDate = libs.CurrentTime()
//        signature.Signature = nil
//        signature.Checksum = nil

        signatures.Id = document
        signatures.Signatures = append(signatures.Signatures, signature)

        c.Insert(&signatures)
    }

    return 0
}



func unsign(c *mgo.Collection, document string, login string, token string) (int) {
    var signatures model.DBDocumentData

    count, err := c.Find(bson.M{"id": document}).Count()
    if err != nil {
        return -1
    }

    if count < 1 {
        return 1
    }

    err = c.Find(bson.M{"id": document}).One(&signatures)
    if err != nil {
        return -1
    }

    var new_signatures []model.DBSignData

    // search and remove (skip) user signature
    for _, sign := range signatures.Signatures {
        if sign.Login != login {
            new_signatures = append(new_signatures, sign)
        }
    }

    data_change := bson.M{"signatures" : new_signatures}

    change := mgo.Change{
        Update:  bson.M{"$set": data_change},
        ReturnNew: false,
    }

    c.Find(bson.M{"login": login}).Apply(change, &signatures)


    return 0
}


func verify(c *mgo.Collection, document string, login string, token string) (int) {
    var signatures model.DBDocumentData

    count, err := c.Find(bson.M{"id": document}).Count()
    if err != nil {
        return -1
    }

    if count < 1 {
        return 1
    }

    err = c.Find(bson.M{"id": document}).One(&signatures)
    if err != nil {
        return -1
    }

    found := false

    // search and remove (skip) user signature
    for _, sign := range signatures.Signatures {
        if sign.Login == login {
            found = true
            break
        }
    }

    if !found {
        return 1
    }

    return 0
}



func About(w http.ResponseWriter, r *http.Request) {
    test := model.AboutData{"Version: 0.1"}

    message, err := json.Marshal(test)

    if err != nil {
        panic(err)
    }

    w.Write(message)
}



func User(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("user/[^/]+/[^/]+/[^/]+$")

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
    login   := request[2]
    token   := request[4]

    user, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            signatures, err := getKey(db.GetCollectionKeys(), user.Login)

            if err < 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            if err == 1 {
                w.WriteHeader(http.StatusNotFound)
                return
            }

            json_message, err_json := json.Marshal(signatures)
            if err_json != nil {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            w.Write(json_message)
            break
        case "PUT":
            var keys model.NewKeysData

            err := json.NewDecoder(r.Body).Decode(&keys)
            if err != nil {
                w.WriteHeader(http.StatusInternalServerError)
            }
            
            ret = updateKeys(db.GetCollectionKeys(), login, keys)

            if ret < 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            if ret == 1 {
                w.WriteHeader(http.StatusNotFound)
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

    request  := strings.Split(r.URL.Path, "/")
    document := request[2]
    token    := request[3]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            signatures, err := getSignatures(db.GetCollection(), document)

            if err < 0 {
                w.WriteHeader(http.StatusInternalServerError)
                return
            }

            if err == 1 {
                w.WriteHeader(http.StatusNotFound)
                return
            }

            json_message, err_json := json.Marshal(signatures)
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



func Sign(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("sign/[^/]+/[^/]+$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    request  := strings.Split(r.URL.Path, "/")
    document := request[2]
    token    := request[3]

    user, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "PUT":
            status := sign(db.GetCollection(), document, user.Login, token)

            switch status {
                case 0:
                    w.WriteHeader(http.StatusOK)
                    break;
                case 1:
                    w.WriteHeader(http.StatusNotFound)
                    break;
                default:
                    w.WriteHeader(http.StatusInternalServerError)
                    break;
            }

            break
        default:
            fmt.Println("Bad request")
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}



func Unsign(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("unsign/[^/]+//[^/]+$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    request  := strings.Split(r.URL.Path, "/")
    document := request[2]
    token    := request[3]

    user, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "DELETE":
            status := unsign(db.GetCollection(), document, user.Login, token)

            switch status {
                case 0:
                    w.WriteHeader(http.StatusOK)
                    break;
                case 1:
                    w.WriteHeader(http.StatusNotFound)
                    break;
                default:
                    w.WriteHeader(http.StatusInternalServerError)
                    break;
            }

            break
        default:
            fmt.Println("Bad request")
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}




func Verify(w http.ResponseWriter, r *http.Request) {
    re, err := regexp.CompilePOSIX("verify/[^/]+/[^/]+/[^/]+$")

    if err != nil {
        w.WriteHeader(http.StatusInternalServerError)
        return
    }

    valid_request := re.FindString(r.URL.Path[1:])

    if valid_request == "" {
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    request  := strings.Split(r.URL.Path, "/")
    document := request[2]
    login    := request[3]
    token    := request[4]

    _, ret := remote.VerifyToken(token)
    if ret != 200 {
        w.WriteHeader(http.StatusForbidden)
        return
    }

    switch r.Method {
        case "GET":
            status := verify(db.GetCollection(), document, login, token)

            switch status {
                case 0:
                    w.WriteHeader(http.StatusOK)
                    break;
                case 1:
                    w.WriteHeader(http.StatusNotFound)
                    break;
                default:
                    w.WriteHeader(http.StatusInternalServerError)
                    break;
            }

            break
        default:
            fmt.Println("Bad request")
            w.WriteHeader(http.StatusBadRequest)
            break
    }
    return
}
