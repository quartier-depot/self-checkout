#!/bin/bash
set -e

# Change to the web directory
cd $SNAP/web

# Start the http-server on port 8080
$SNAP/bin/node $SNAP/lib/node_modules/my-http-server/node_modules/.bin/http-server -p 3000 -a 0.0.0.0
