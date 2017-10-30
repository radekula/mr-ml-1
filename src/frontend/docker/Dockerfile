FROM debian:latest

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
    locales \
    --no-install-recommends 

RUN localedef -i pl_PL -c -f UTF-8 -A /usr/share/locale/locale.alias pl_PL.UTF-8
ENV LANG pl_PL.UTF-8
ENV LC_MESSAGES C

RUN apt-get install -y \
    php \
    php-fpm \
    php-curl \
    php-uuid \
    nginx \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/cache/apt/archives

ADD docker/default /etc/nginx/sites-available/

COPY www /usr/share/nginx/html/
COPY functions /usr/share/nginx/html/

ADD index.php /usr/share/nginx/html/
ADD robots.txt /usr/share/nginx/html/

ADD docker/start.sh /usr/local/bin/
RUN ["chmod", "+x", "/usr/local/bin/start.sh"]

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/start.sh"]
