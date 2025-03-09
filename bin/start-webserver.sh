#!/bin/bash
set -e

ln -snf /lib/node-modules/self-checkout/node_modules node_modules

# Change to the web directory
cd $SNAP

# Start the http-server
$SNAP/bin/node express/express.cjs
