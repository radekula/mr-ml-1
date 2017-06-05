documents-database
==================

---

## Description

This service is responsible for managing documents.

## Basics

Service is writen in go langugage and can be run inside docker container.

###  Requirements

  * Linux system (Debian 8, Fedora 25, Ubuntu 16.04 or later recommended)
  * Docker installed
  * golang installed 

## How to build

(all this can be done using `build` script prowided inside docker directory)

Go into docker directory.

* create 'go' directory and inside src directory: `mkdir -p go/src`
* get your current path: `pwd`
* set GOPATH to {current path}/go: `export GOPATH={current path}/go`
* execute: `go get gopkg.in/mgo.v2`
* build executable: `CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o documents-database ../src/main.go`
* build docker image: `docker build -t documents-database .`

## How to run

__First run MongoDB service:__

```
docker run -d --name documents-database-mongo -v {host_path}:/data/db mongo
```

where {host_path} is a local path to a directory where database files will be stored

__Next run documents-database service:__

```
docker run -d -p 8080:8080 --link documents-database-mongo:documents-database-mongo --name documents-database documents-database
```

Service is now available on linux host on port 8080.
