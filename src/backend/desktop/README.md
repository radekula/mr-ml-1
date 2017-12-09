desktop
==================

---

## Description

This service is responsible for providing data to desktop page

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

__Run desktop service:__

```
docker run -d -p 8086:8080 --name desktop desktop
```

Service is now available on linux host on port 8086.
