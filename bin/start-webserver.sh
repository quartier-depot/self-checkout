#!/bin/bash
set -e

# Change to the web directory
cd $SNAP

# Start the http-server
$SNAP/bin/node express/express.cjs
