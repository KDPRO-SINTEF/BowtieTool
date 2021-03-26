#!/bin/bash
help_message="USAGE: ./start.sh [app]
app:
    <<empty>>: launch the entire app
    frontend: launch the frontend
    backend: launch the backend"

if [ "$#" = 0 ]; then
    mkdir -p backend/app/media/QR
    mkdir -p backend/app/logs
    docker-compose up
elif [ "$#" = 1 ]; then
    if [ "$1" = "-h" -o "$1" = "--help" ]; then
        echo "$help_message"
    elif [ "$1" = "frontend" ]; then
        cd ./frontend; docker-compose up
    elif [ "$1" = "backend" ]; then
        cd ./backend
	mkdir -p app/media/QR
	mkdir -p app/logs
	docker-compose up
    else
        echo "Illegal argument '$1'"
        echo "$help_message"
    fi
else
    echo "Illegal arguments"
    echo "$help_message"
fi
