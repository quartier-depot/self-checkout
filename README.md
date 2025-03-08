# Quartier Depot Self Checkout

A self-checkout POS using a WooCommerce backend tailored for [Quartier Depot](https://www.quartier-depot.ch/).

## Install

### Configuration

A configuration file is expected to be at `<userData>/config.json` (i.e. `/Users/<usr>/Library/Application Support/self-checkout/config.json` on Mac)

```json
{
  "woocommerce": {
    "url": "https://...",
    "consumerKey": "ck_42...",
    "consumerSecret": "cs_42..."
  },
  "appInsights": {
    "connectionString": "InstrumentationKey=42..."
  }
}
```

Note, while developing with a browser, these values are taken from the `.env.development` file.

## Techstack

- Vite
- React
- Typescript
- Tanstack Query
- Tailwind

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
