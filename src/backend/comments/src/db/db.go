package db

import (
    "sync"
    "gopkg.in/mgo.v2"
    "../config"
)

var collection *mgo.Collection
var once sync.Once

func GetCollection() *mgo.Collection {
    once.Do(func() {
        conf := config.GetConfig()
 
        session, err := mgo.Dial(conf.Database.Host)
        if err != nil {
            panic(err)
        }

        collection = session.DB(conf.Database.Name).C(conf.Database.Collection)
    })

    return collection
}
