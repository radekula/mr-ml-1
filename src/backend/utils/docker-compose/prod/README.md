docker-compose - production enviroment
==================

---

## Description

This is a definition for production enviroment of backend.

## Usage

All commands run inside 'utils/docker-compose/prod' directory.

Starting up:
```
docker-compose up -d
```

Shutting up:
```
docker-compose down
```

Updating containers:
```
docker-compose up --force-recreate -d
```
or
```
docker-compose down && docker-compose pull && docker-compose up -d
```
