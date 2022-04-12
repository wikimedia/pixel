#!/usr/bin/env bash

curl https://pixeltool.netlify.app/database.tar.gz -o var/lib/mysql/database.tar.gz
tar -xvf var/lib/mysql/database.tar.gz
