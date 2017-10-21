package app_init

import (
    "fmt"
    "gopkg.in/mgo.v2"
    "gopkg.in/mgo.v2/bson"
    "../model"
    "../libs"
)


func Init() {
    fmt.Println("Database initialization")

    session, err := mgo.Dial("users-database-mongo")
    if err != nil {
        panic(err)
    }
    defer session.Close()

    var user model.DBUserData

    collection := session.DB("usersDatabase").C("users")
    count, err := collection.Find(bson.M{"login": "admin"}).Count()

    if err != nil {
        panic(err)
    }
    
    if count > 0 {
        fmt.Println("User admin already exists: skipping initialization.")
        return
    }

    user.Type = "admin"
    user.Active = true
    user.Login = "admin"
    user.FirstName = ""
    user.LastName = ""
    user.Email = "admin@users"
    user.Password = libs.HashPasswd("admin123")
    user.Token = ""
    user.ExpirationTime = ""
    user.LastLogin = ""
    user.LastActive = ""

    err = collection.Insert(&user)

    if err != nil {
        panic(err)
    }
    
    fmt.Println("User admin created")
    return
}
