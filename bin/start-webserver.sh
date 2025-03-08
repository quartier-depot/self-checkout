#!/bin/bash
set -e

# Change to the web directory
cd $SNAP

# Start the http-server
$SNAP/bin/node $SNAP/lib/node_modules/quartier-depot-self-checkout/node_modules/.bin/express express.cjs
