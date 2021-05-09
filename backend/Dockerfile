FROM python:3.7-alpine
MAINTAINER Moulkaf Badreddine

RUN apk update
ENV PYTHONUNBUFFERED 1
RUN apk add python3 py3-pip && \
	pip install --upgrade pip
COPY ./requirements.txt /requirements.txt
RUN apk add --update --no-cache postgresql-client
RUN apk add --update --no-cache --virtual .tmp-build-deps \
        gcc libc-dev linux-headers postgresql-dev
RUN apk add zlib-dev jpeg-dev gcc musl-dev
RUN apk add --update --no-cache \
           graphviz \
           ttf-freefont
RUN pip3 install -r /requirements.txt
RUN apk del .tmp-build-deps

RUN mkdir /app
WORKDIR /app
COPY ./app /app

RUN adduser -D user
RUN chown -R root:user /app
RUN chmod 755 /app
USER user
