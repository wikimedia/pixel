#!/usr/bin/env bash

curl "https://pixeltool.netlify.app/database_2022-04-16_14-47-16-0600(MDT).tar.gz" -o var/lib/mysql/database.tar.gz
tar -xvf var/lib/mysql/database.tar.gz
