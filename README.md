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

## Development

### Install

```bash
$ cd ./app
$ npm install
```

### Run (react app)

```bash
$ npm run dev
```

Create `.env` file first with `.env.template` in `./app` folder.


### Run (express server)

```bash
$ cd ./app
$ npm install
$ npm run build
$ cd ../server
$ npm install
$ npx dotenvx run -f ../app/.env -- node webserver.cjs
```

### Run (container)

```bash
$ podman build -t quartier-depot-self-checkout -f Containerfile . 
$ podman run --env-file ./app/.env -p 3000:3000 localhost/quartier-depot-self-checkout:latest
```

## Release

1. Tag the codebase (i.e. '1.0.0') and push `git push --tags`.
2. A [GitHub action] builds the container and publishes it.

## Install

1. Prepare an `.env` file.
2. `podman run --env-file .env -p 3000:3000 ghcr.io/quartier-depot/self-checkout:latest`

## Update

1. `podman stop --all`
2. Re-run with `:latest`

### Recommended IDE Setup

* [VSCode](https://code.visualstudio.com/)
* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
* [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Deployment at Quartierdepot

Although there are other deployment options (like hosting on a Webserver),
we deploy the application directly to the POS device in a container.

The container runs an Express server internally and takes care of calls to the backend,
keeping the secrets save (they are not exposed to the browser and encrypted for backend communication)
and taking care of CORS (all calls from web application are routed through a proxy).

See also [setup.md](./doc/setup.md)

## Credits

Kudos to the following projects for source code and inspiration:

- Point of Sale: https://point-of-sale.dev/
- Tailwind POS: https://github.com/emsifa/tailwind-pos
- WooCommerce POS: https://wcpos.com / https://github.com/wcpos