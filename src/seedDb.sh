#!/usr/bin/env bash

curl "https://nicholasray.github.io/pixel-seed-data/database_2022-05-26_13-03-37-0700(PDT).tar.gz" -o var/lib/mysql/database.tar.gz 
tar -xvf var/lib/mysql/database.tar.gz
