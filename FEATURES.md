# Features

## Scan by product code

![Scan](./app/tests/e2e/scan.spec.ts-snapshots/cart-chromium-darwin.png)

### Supports multiple barcodes per product

* A product can have multiple barcodes in a semicolon separated list

### Support weight encoded barcodes

* A product can have a weight encoded barcode
* The weight is added to the cart automatically
* The barcode has the weight replaced with `w` and is followed by a `c` (i.e. `210987654wwwwc`)

## Search by category

* Products without barcode are grouped by category (i.e. Fruits and Softdrinks)

![Browse](./app/tests/e2e/browse.spec.ts-snapshots/browse-two-categories-chromium-darwin.png)

## Search by article Id

* Enter a part of the articles ID and press OK to search for the product.

![Numpad](./app/tests/e2e/search.spec.ts-snapshots/numpad-chromium-darwin.png)

![Result](./app/tests/e2e/search.spec.ts-snapshots/spaghetti-chromium-darwin.png)

## Search by past orders (favorites)

## Search by pre-orders

* Integrates with the [WooCommerce OnDemand Lists](https://github.com/quartier-depot/Quartierdepot---OnDemand-Lists) plugin.
* Adds the pre-ordered quantity to the cart in one click (i.e. 10 apples) 

![Pick-Up](./app/tests/e2e/pickup.spec.ts-snapshots/pick-up-add-apples-to-cart-chromium-darwin.png)

## Pay with virtual wallet

* Integrates with the [TeraWallet Plugin](https://wordpress.org/plugins/woo-wallet/)

![After Login](./app/tests/e2e/payment.spec.ts-snapshots/after-login-chromium-darwin.png)

![Cart](./app/tests/e2e/payment.spec.ts-snapshots/cart-chromium-darwin.png)

![Confirmation](./app/tests/e2e/payment.spec.ts-snapshots/confirmation-wallet-chromium-darwin.png)

## Pay with Twint

* Integrates with [Payrexx](https://payrexx.com/de-ch)

