#!/bin/sh

set -eux

exec supervisord -c /app/supervisord.conf
