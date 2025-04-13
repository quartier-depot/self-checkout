# Quartier Depot Self Checkout

A self-checkout POS using a WooCommerce backend tailored for [Quartier Depot](https://www.quartier-depot.ch/).

## Backend prerequisites

* Wordpress 
* WooCommerce 
* User with role "Shop-Manager"
* WooCommerce REST-API Key for shop-manager with read/write rights (`woocommerce-consumer-key` and `woocommerce-consumer-secret`)
* ACF
* Products with field `barcode` and `artikel-id`
* Customers with field ....

## Install

1. Setup [Ubuntu Core 22](https://ubuntu.com/core/docs/install-with-dd)
1. `snap install quartier-depot-self-checkout`
1. `snap set quartier-depot-self-checkout woocommerce-url=... woocommerce-consumer-key=... woocommerce-consumer-secret=... applicationinsights-connection-string=...`
1. Open http://localhost:3000

## Techstack

- Vite
- React
- Typescript
- Tanstack Query
- Tailwind
- Snapcraft
- Express

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

Create `.env` file first with `.env.template`.


### Build

```bash
$ npm run build:linux
```

Requires `snapcraft`.

### Run 

```bash
$ npx dotenvx run -- node webserver.cjs
```

Create `.env` file first with `.env.template`.

### Recommended IDE Setup

* [VSCode](https://code.visualstudio.com/)
* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
* [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)


## Troubleshooting

* `sudo snap logs quartier-depot-self-checkout`
* `sudo journalctl -ef -u snap.quartier-depot-self-checkout.quartier-depot-self-checkout`

See also: https://snapcraft.io/blog/snapcraft-development-tips-how-to-troubleshoot-snaps-with-services


## Credits

Kudos to the following projects for inspiration.

- Point of Sale: https://point-of-sale.dev/
- Tailwind POS: https://github.com/emsifa/tailwind-pos
- WooCommerce POS: https://wcpos.com / https://github.com/wcpos
- Context/Reducer with TypeScript: https://github.com/m-oniqu3/context-reducer

