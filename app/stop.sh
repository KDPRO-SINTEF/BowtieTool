#!/bin/bash
help_message="USAGE: ./stop.sh [app]
app:
    <<empty>>: stop the whole app launched with ./start.sh
    frontend: stop the frontend launched with ./start.sh frontend
    backend: stop the backend launched with ./start.sh backend"

if [ "$#" = 0 ]; then
    echo "Killing bowtie++ containers..."
    docker container kill bowtie_web
    docker container kill bowtie_api
    docker container kill bowtie_db
elif [ "$#" = 1 ]; then
    if [ "$1" = "-h" -o "$1" = "--help" ]; then
        echo "$help_message"
    elif [ "$1" = "frontend" ]; then
	echo "Killing bowtie++ frontend containers..."
        docker container kill bowtie_front_web
    elif [ "$1" = "backend" ]; then
	echo "Killing bowtie++ backend containers..."
        docker container kill bowtie_back_api
	docker container kill bowtie_back_db
    else
        echo "Illegal argument '$1'"
        echo "$help_message"
    fi
else
    echo "Illegal arguments"
    echo "$help_message"
fi
