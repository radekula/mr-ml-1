docker-compose - test enviroment
==================

---

## Description

This is a definition for test enviroment of backend.

## Usage

All commands run inside 'utils/docker-compose/test' directory.

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
docker-compose down && docker-compose pull && docker-compose up -d
```
