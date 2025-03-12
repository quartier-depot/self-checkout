#!/bin/bash
set -e

URL=$(snapctl get url)
API_KEY=$(snapctl get api-key)

WOOCOMMERCE_URL=$(snapctl get woocommerce-url)
WOOCOMMERCE_CONSUMER_KEY=$(snapctl get woocommerce-consumer-key)
WOOCOMMERCE_CONSUMER_SECRET=$(snapctl get woocommerce-consumer-secret)
APPLICATIONINSIGHTS_CONNECTION_STRING=$(snapctl get applicationinsights-connection-string)

$SNAP/bin/node $SNAP/lib/node_modules/self-checkout/webserver.cjs
