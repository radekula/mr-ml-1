flows
==================

---

## Description

This service is responsible for managing flows.

## Basics

Service is writen in go langugage and can be run inside docker container.

###  Requirements

  * Linux system (Debian 8, Fedora 25, Ubuntu 16.04 or later recommended)
  * Docker installed
  * golang installed 

## How to build

(all this can be done using `build` script prowided inside docker directory)

Go into docker directory.

* run `./build` script to build app
* run `./build_container` to build app and container 

## How to run

__First run MongoDB service (you can skip this step if you want to use existing database):__

```
docker run -d --name flows-database-mongo -v {host_path}:/data/db mongo
```

where {host_path} is a local path to a directory where database files will be stored

__Next run users service:__

```
docker run -d -p 8083:8080 --link {database_service_name}:flows-database-mongo --name flows flows
```

Service is now available on linux host on port 8083.
