FROM python:3.7-alpine
MAINTAINER Moulkaf Badreddine

ENV PYTHONUNBUFFERED 1
COPY ./requirements.txt /requirements.txt
RUN apk add --update --no-cache postgresql-client
RUN apk add --update --no-cache --virtual .tmp-build-deps \
        gcc libc-dev linux-headers postgresql-dev
RUN apk add zlib-dev jpeg-dev gcc musl-dev
RUN apk add --update --no-cache \
           graphviz \
           ttf-freefont
RUN pip install -r /requirements.txt
RUN apk del .tmp-build-deps

RUN mkdir /app
WORKDIR /app
COPY ./app /app

RUN adduser -D user
USER user