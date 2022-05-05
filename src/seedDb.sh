#!/usr/bin/env bash

curl "https://pixeltool.netlify.app/database_2022-05-05_14-29-49-0600(MDT).tar.gz" -o var/lib/mysql/database.tar.gz
tar -xvf var/lib/mysql/database.tar.gz
