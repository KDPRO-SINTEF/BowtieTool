FROM httpd:2.4
MAINTAINER Clement Chavanon

RUN mkdir app
WORKDIR /app
COPY ./webapp/ /app
COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf
RUN ln -s /app/javascript /usr/local/apache2/htdocs/javascript
