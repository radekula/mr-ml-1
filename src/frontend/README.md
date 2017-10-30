godms
==================

---

## Description

This service is responsible for managing documents.

## Basics

This is frontend for godms application. It's written in php language with HTML5. Frontend can be run in a container.  

###  Requirements

  * Linux system (Debian 8, Fedora 25, Ubuntu 16.04 or later recommended)
  * Docker installed
  * or WWW server with php support installed (and configured)

## How to build - Docker

Go into frontend root directory and hit './build'.
All system requirements will be build inside docker image.

## How to build - WWW server

Make sure your WWW server installation can support php.
Make sure that your php installation supports:
  * php-fpm
  * php-curl
  * php-uuid

## Configuration

Inside 'config' directory is an example config file. You need to adjust configuration to your needs.

Sample configuration:
```
[server]
base_url=http://192.168.124.63:8080/www/

[users]
url=192.168.124.63:8081

[groups]
url=192.168.124.63:8082

[documents]
url=192.168.124.63:8083

[flows]
url=192.168.124.63:8084
```
Explanation:
  * 'base_url' - this is URL where 'img', 'js', 'css' and 'fonts' directories are located (in docker image they are inside www directory)
  * 'url' - URL to given service

## How to run - Docker

To run godms frontend just hit:

```
docker run -itd --name godms -v {path_to_config_file}:/usr/share/nginx/html/config/config.ini -p {host_port}:80 godms
```

## How to run - WWW server

  * copy sources to directory where web page will be (earlier configured in WWW server)
  * set proper file permissions

## Development - Docker

You can very easly develop this frontend inside docker.
To run in 'develop mode' you need to slightly modify command to run container:

```
docker run -itd --name godms -v {path_to_root_dir_of_frontend_on_host}:/usr/share/nginx/html -p {host_port}:80 godms
```
Now you can edit files on on host directly. Changes will be immediately visible inside container.

If you need to restart fpm you can do this by entering contaner:
```
docker exec -it godms bash
```
and run this command:
'/etc/init.d/php7.0-fpm restart'
