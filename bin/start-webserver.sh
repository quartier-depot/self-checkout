#!/bin/bash
set -e

export WOOCOMMERCE_URL=$(snapctl get woocommerce-url)
export WOOCOMMERCE_CONSUMER_KEY=$(snapctl get woocommerce-consumer-key)
export WOOCOMMERCE_CONSUMER_SECRET=$(snapctl get woocommerce-consumer-secret)
export APPLICATIONINSIGHTS_CONNECTION_STRING=$(snapctl get applicationinsights-connection-string)
export SNAP_VERSION=$(snap info quartier-depot-self-checkout | grep "^installed:" | awk '{print $2}')

$SNAP/bin/node $SNAP/lib/node_modules/self-checkout/webserver.cjs
