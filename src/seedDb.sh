#!/usr/bin/env bash

curl "https://pixeltool.netlify.app/database_2022-04-26_15-09-17-0600(MDT).tar.gz" -o var/lib/mysql/database.tar.gz
tar -xvf var/lib/mysql/database.tar.gz
