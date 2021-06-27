FROM nginx:stable-alpine
LABEL maintainer="Clément Chavanon"

COPY nginx/nginx.conf /etc/nginx/nginx.conf

RUN mkdir app
RUN ln -s /app/bowtie /usr/share/nginx/html/bowtie