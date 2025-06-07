#!/bin/bash
set -e

export WOOCOMMERCE_URL=$(snapctl get woocommerce-url)
export WOOCOMMERCE_CONSUMER_KEY=$(snapctl get woocommerce-consumer-key)
export WOOCOMMERCE_CONSUMER_SECRET=$(snapctl get woocommerce-consumer-secret)
export APPLICATIONINSIGHTS_CONNECTION_STRING=$(snapctl get applicationinsights-connection-string)

$SNAP/bin/node $SNAP/lib/node_modules/self-checkout/webserver.cjs
