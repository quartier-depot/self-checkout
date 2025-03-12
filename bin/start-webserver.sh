#!/bin/bash
set -e

URL=$(snapctl get url)
API_KEY=$(snapctl get api-key)

WOOCOMMERCE_URL=$(snapctl get woocommerce-url)
WOOCOMMERCE_CONSUMER_KEY=$(snapctl get woocommerce-consumer-key)
WOOCOMMERCE_CONSUMER_SECRET=$(snapctl get woocommerce-consumer-secret)
APPINSIGHTS_CONNECTION_STRING=$(snapctl get appinsights-connection-string)

$SNAP/bin/node $SNAP/node_modules/quartier-depot-self-checkout/webserver.cjs
