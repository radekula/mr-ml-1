package db

import (
    "sync"
    "gopkg.in/mgo.v2"
    "../config"
)

var collectionFlows *mgo.Collection
var collectionSteps *mgo.Collection
var onceFlows sync.Once
var onceSteps sync.Once

func GetCollection() *mgo.Collection {
    onceFlows.Do(func() {
        conf := config.GetConfig()
 
        session, err := mgo.Dial(conf.Database.Host)
        if err != nil {
            panic(err)
        }

        collectionFlows = session.DB(conf.Database.Name).C(conf.Database.Collection)
    })

    return collectionFlows
}

func GetCollectionSteps() *mgo.Collection {
    onceSteps.Do(func() {
        conf := config.GetConfig()
 
        session, err := mgo.Dial(conf.Database.Host)
        if err != nil {
            panic(err)
        }

        collectionSteps = session.DB(conf.Database.Name).C(conf.Database.CollectionSteps)
    })

    return collectionSteps
}
