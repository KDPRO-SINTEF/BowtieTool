#!/bin/bash
if [ $# = 0 ]; then
    docker-compose up
elif [ $# = 1 ]; then
    if [ $1 = "frontend" ]; then
        cd ./frontend; docker-compose up
    elif [ $1 = "backend" ]; then
        cd ./backend; docker-compose up
    else
        echo "Invalid argument"
    fi
else
    echo "Too many arguments"
fi

