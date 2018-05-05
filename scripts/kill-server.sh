#!/bin/bash -e

if [ `fuser 8081/tcp` ]; then
echo "Restarting server."
fuser -k 8081/tcp
fi