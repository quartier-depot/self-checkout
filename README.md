# Quartier Depot Self Checkout

A self-checkout POS using a WooCommerce backend tailored for [Quartier Depot](https://www.quartier-depot.ch/).

## Install

1. Setup [Ubuntu Core 22](https://ubuntu.com/core/docs/install-with-dd)
2. `snap install ubuntu-frame`
3. `snap install wpe-webkit-mit-kiosk`
4. `snap set wpe-webkit-mit-kiosk url=http://localhost:3000`
5. `snap set quartier-depot-self-checkout woocommerce-url=... woocommerce-consumer-key=... woocommerce-consumer-secret=... appinsights-connection-string=...`

## Techstack

- Vite
- React
- Typescript
- Tanstack Query
- Tailwind

## Development

While developing with a browser, configuration values are taken from the `.env` file. 

## Credits

Kudos to the following projects for inspiration.

- Point of Sale: https://point-of-sale.dev/
- Tailwind POS: https://github.com/emsifa/tailwind-pos
- WooCommerce POS: https://wcpos.com / https://github.com/wcpos
- Context/Reducer with TypeScript: https://github.com/m-oniqu3/context-reducer

## Notes

- For the scanner to read barcodes correctly, set the keyboard layout to English.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
