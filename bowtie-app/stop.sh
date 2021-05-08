#!/bin/bash
help_message="USAGE: ./stop.sh [app]
app:
    <<empty>>: stop the whole app launched with ./start.sh
    frontend: stop the frontend launched with ./start.sh frontend
    backend: stop the backend launched with ./start.sh backend"

if [ "$#" = 0 ]; then
    echo "Killing bowtie++ containers..."
    docker container kill bowtietool_web_1
    docker container kill bowtietool_app_1
    docker container kill bowtietool_db_1
elif [ "$#" = 1 ]; then
    if [ "$1" = "-h" -o "$1" = "--help" ]; then
        echo "$help_message"
    elif [ "$1" = "frontend" ]; then
	echo "Killing bowtie++ frontend containers..."
        docker container kill frontend_web_1
    elif [ "$1" = "backend" ]; then
	echo "Killing bowtie++ backend containers..."
        docker container kill backend_app_1
	docker container kill backend_db_1
    else
        echo "Illegal argument '$1'"
        echo "$help_message"
    fi
else
    echo "Illegal arguments"
    echo "$help_message"
fi
