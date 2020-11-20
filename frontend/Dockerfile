FROM httpd:2.4
MAINTAINER Clement Chavanon

RUN mkdir app
WORKDIR /app
COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf
RUN ln -s /app /usr/local/apache2/htdocs/app
