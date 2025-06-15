# Quartier Depot Self Checkout

A self-checkout POS using a WooCommerce backend tailored for [Quartier Depot](https://www.quartier-depot.ch/).

## Backend prerequisites

* Wordpress 
* WooCommerce 
  * User with role "Shop-Manager"
  * WooCommerce REST-API Key for shop-manager with read/write rights (`woocommerce-consumer-key` and `woocommerce-consumer-secret`)
* ACF
  * Products with field `barcode` and `artikel-id`
  * Customers with field `member_id`
* Plugin [quartierdepot-memberid](https://github.com/quartier-depot/quartierdepot-memberid)
  * Exposes `acf/member_id` field in customer DTO of Woocommerce REST API

## Techstack

- Vite
- React
- Typescript
- React Redux
- Tailwind
- Snapcraft
- Express

## Project Setup

### Install

```bash
$ npm install
```

### Run (development)

```bash
$ npm run dev
```

Create `.env` file first with `.env.template`.


### Run (build without snap)

```bash
$ npm run build
$ npx dotenvx run -- node webserver.cjs
```

Create `.env` file first with `.env.template`.


### Build

1. `npm run build` creates the application in `/dist`
2. Set the version number in [snapcraft.yaml](./snap/snapscraft.yaml)
3. `snapcraft` creates the `*.snap`


### Publish

```bash
$ snapcraft login
$ snapcraft push quartier-depot-self-checkout_0.0.1_amd64.snap --release=stable
$ snapcraft list-revisions quartier-depot-self-checkout
```

Note: Use the `release.sh` script to build and publish.

### Install

```bash
$ sudo snap install quartier-depot-self-checkout
$ sudo snap set quartier-depot-self-checkout woocommerce-url=https://webshop.quartier-depot.ch woocommerce-consumer-key=ck_b... woocommerce-consumer-secret=cs_5... applicationinsights-connection-string="InstrumentationKey=6..."
```

### Update 

```bash
$ sudo snap stop quartier-depot-self-checkout
$ sudo snap refresh quartier-depot-self-checkout
```

The system automatically refreshes all snaps on shutdown (see setup.md).


### Recommended IDE Setup

* [VSCode](https://code.visualstudio.com/)
* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
* [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)


## Deployment at Quartierdepot

Although there are other deployment options (like hosting on a Webserver),
we deploy the application directly to the POS device as an Ubuntu Snap application.

The Snap application runs an Express server internally and takes care of calls to the backend,
keeping the secrets save (they are not exposed to the browser and encrypted for backend communication)
and taking care of CORS (all calls from web application are routed through a proxy).

See also [setup.md](./doc/setup.md)

## Troubleshooting

* `sudo snap logs quartier-depot-self-checkout`
* `sudo journalctl -ef -u snap.quartier-depot-self-checkout.quartier-depot-self-checkout`

See also: https://snapcraft.io/blog/snapcraft-development-tips-how-to-troubleshoot-snaps-with-services

## Credits

Kudos to the following projects for source code and inspiration:

- Point of Sale: https://point-of-sale.dev/
- Tailwind POS: https://github.com/emsifa/tailwind-pos
- WooCommerce POS: https://wcpos.com / https://github.com/wcpos