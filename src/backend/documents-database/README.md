# mr-ml


Run documents-database-mongo service:
docker run -d --name documents-database-mongo -v {host_path}:/data/db mongo

Run documents-database service
docker run -d -p 8080:8080 --link documents-database-mongo:documents-database-mongo --name documents-database documents-database
