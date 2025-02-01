type BarcodeEvent = {
  value: string,
  symbology: string,
  'data': {
    'elements': {
      'ai': string,
      'label': string,
      'value': string
    }[],
    'gtin': string
  }
}