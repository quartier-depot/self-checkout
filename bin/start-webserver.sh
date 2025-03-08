#!/bin/bash
set -e

# Change to the web directory
cd $SNAP/dist

# Start the http-server
$SNAP/bin/node $SNAP/lib/node_modules/my-http-server/node_modules/.bin/http-server -p 3000
