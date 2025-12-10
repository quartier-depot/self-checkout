import { Page } from '@playwright/test';

export async function mockWoocommerce(page: Page) {
  
  await page.route('**/wp-json/wc/v3/products**', async (route, request) => {
    const url = new URL(request.url());
    const page = url.searchParams.get('page');
    const headers: { [key: string]: string; } = {  };
    headers['x-wp-totalpages'] = '2';

    let products = [];
    switch (page) {
      case "1": {
        products = [
          // Softdrinks (no barcode)
          product({ id: 101, name: 'Cola', price: 1, articleId: 'S01', category: 'S - Softdrinks', barcodes: [], freitext: '' }),
          product({ id: 102, name: 'Eistee', price: 2, articleId: 'S02', category: 'S - Softdrinks', barcodes: [], freitext: '' }),
          // Pasta (no barcode, many products)
          ...(["Spaghetti", "Penne", "Fettuccine", "Rigatoni", "Fusilli", "Linguine", "Pappardelle", "Orecchiette", "Conchiglie", "Bucatini", "Rotini", "Cavatappi", "Macaroni", "Tagliatelle", "Gemelli", "Campanelle", "Paccheri", "Ravioli", "Tortellini"].map(((name, index) =>
            product({id: 200+index, name, price: 1 + index/10, articleId: `P${(index+1).toString().padStart(2, '0')}`, category: 'P - Pasta', barcodes: ['KEIN BARCODE'],  freitext: ''})))),
        ];
        break;
      }
      case "2": {
        products = [
          // Gemüse (bulk item, weighted barcode, muliple barcodes)
          product({ id: 301, name: 'Salat', price: 0.1, articleId: 'G01', category: 'G - Gemüse', barcodes: ['1234567890301'], freitext: 'pro g'}),
          product({ id: 302, name: 'Spinat', price: 0.2, articleId: 'G02', category: 'G - Gemüse', barcodes: ['1234567890302'], freitext: '' }),
          product({ id: 303, name: 'Erbsen', price: 0.2, articleId: 'G02', category: 'G - Gemüse', barcodes: ['12345678wwwwc'], freitext: '' }),
          // Früchte (simple barcode)
          product({ id: 401, name: 'Apfel', price: 1, articleId: 'F01', category: 'F - Früchte', barcodes: ['1234567890401'], freitext: '' }),
          product({ id: 402, name: 'Birne', price: 2, articleId: 'F02', category: 'F - Früchte', barcodes: ['1234567890402'], freitext: '' }),
        ];
        break;
      }
      default:
        throw new Error('not implemented, page is ' + page);
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(products),
      headers: headers,
    });
  });
  
  await page.route('**/wp-json/wc/v3/customers**', async route => {
    const headers: { [key: string]: string; } = {  };
    headers['x-wp-totalpages'] = '1';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
      headers: headers,
    });
  });
  
}

function product({ id, name, price, articleId, category, barcodes }: { id: number; name: string; price: number; articleId: string; category: string; barcodes: string[]; freitext: string }) {
  return {
    id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    price: price.toFixed(2),
    catalog_visibility: 'visible',
    meta_data: [
      { key: 'artikel-id', value: articleId },
      { key: 'gestell', value: category },
      { key: 'barcode', value: barcodes.join(';') },
      { key: 'freitext', value: '' },
    ],
  };
}


/**
 * Product response example:
 * 
 *     {
 *         "id": 22801,
 *         "name": "Conditioner Orange Grove, Soeder, 250ml",
 *         "slug": "conditioner-orange-grove-soeder-250ml",
 *         "permalink": "https:\/\/quartierdepot-april2024.local\/produkt\/conditioner-orange-grove-soeder-250ml\/",
 *         "date_created": "2023-07-09T10:32:50",
 *         "date_created_gmt": "2023-07-09T08:32:50",
 *         "date_modified": "2024-03-01T17:38:18",
 *         "date_modified_gmt": "2024-03-01T16:38:18",
 *         "type": "simple",
 *         "status": "publish",
 *         "featured": false,
 *         "catalog_visibility": "visible",
 *         "description": "<p>, Artikelnummer: QD-0-0720<\/p>\n",
 *         "short_description": "<p>Soeder<\/p>\n",
 *         "sku": "QD-0-0720",
 *         "price": "15.14",
 *         "regular_price": "15.14",
 *         "sale_price": "",
 *         "date_on_sale_from": null,
 *         "date_on_sale_from_gmt": null,
 *         "date_on_sale_to": null,
 *         "date_on_sale_to_gmt": null,
 *         "on_sale": false,
 *         "purchasable": true,
 *         "total_sales": 2,
 *         "virtual": false,
 *         "downloadable": false,
 *         "downloads": [],
 *         "download_limit": 0,
 *         "download_expiry": 0,
 *         "external_url": "",
 *         "button_text": "",
 *         "tax_status": "taxable",
 *         "tax_class": "",
 *         "manage_stock": false,
 *         "stock_quantity": null,
 *         "backorders": "no",
 *         "backorders_allowed": false,
 *         "backordered": false,
 *         "low_stock_amount": null,
 *         "sold_individually": false,
 *         "weight": "",
 *         "dimensions": {
 *             "length": "",
 *             "width": "",
 *             "height": ""
 *         },
 *         "shipping_required": true,
 *         "shipping_taxable": true,
 *         "shipping_class": "",
 *         "shipping_class_id": 0,
 *         "reviews_allowed": false,
 *         "average_rating": "0.00",
 *         "rating_count": 0,
 *         "upsell_ids": [],
 *         "cross_sell_ids": [],
 *         "parent_id": 0,
 *         "purchase_note": "",
 *         "categories": [
 *             {
 *                 "id": 671,
 *                 "name": "Naturkosmetik",
 *                 "slug": "naturkosmetik-2"
 *             }
 *         ],
 *         "tags": [],
 *         "images": [],
 *         "attributes": [],
 *         "default_attributes": [],
 *         "variations": [],
 *         "grouped_products": [],
 *         "menu_order": 0,
 *         "price_html": "<span class=\"woocommerce-Price-amount amount\"><bdi>15.14&nbsp;<span class=\"woocommerce-Price-currencySymbol\">&#67;&#72;&#70;<\/span><\/bdi><\/span>",
 *         "related_ids": [
 *             19480,
 *             19485,
 *             13978,
 *             23342,
 *             19489
 *         ],
 *         "meta_data": [
 *             {
 *                 "id": 786429,
 *                 "key": "artikel-id",
 *                 "value": "X38"
 *             },
 *             {
 *                 "id": 786430,
 *                 "key": "produzent",
 *                 "value": "Soeder"
 *             },
 *             {
 *                 "id": 786431,
 *                 "key": "herkunftsort",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 786432,
 *                 "key": "zertifizierung",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 786433,
 *                 "key": "lieferanten",
 *                 "value": "Soeder"
 *             },
 *             {
 *                 "id": 786434,
 *                 "key": "freitext",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 786435,
 *                 "key": "volumen",
 *                 "value": "500ml"
 *             },
 *             {
 *                 "id": 786436,
 *                 "key": "pflichtprodukt",
 *                 "value": "Ja"
 *             },
 *             {
 *                 "id": 786437,
 *                 "key": "gestell",
 *                 "value": "X - Naturkosmetik"
 *             },
 *             {
 *                 "id": 786438,
 *                 "key": "_wp_page_template",
 *                 "value": "default"
 *             },
 *             {
 *                 "id": 872270,
 *                 "key": "_last_editor_used_jetpack",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872271,
 *                 "key": "_genesis_scripts_body_position",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872272,
 *                 "key": "_freitext",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872273,
 *                 "key": "_artikel-id",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872274,
 *                 "key": "_gestell",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872275,
 *                 "key": "etikettendruck",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872276,
 *                 "key": "_etikettendruck",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872277,
 *                 "key": "_produzent",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872278,
 *                 "key": "_herkunftsort",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872279,
 *                 "key": "_zertifizierung",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872280,
 *                 "key": "_lieferanten",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872281,
 *                 "key": "produzentenwebseite",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872282,
 *                 "key": "_produzentenwebseite",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872283,
 *                 "key": "_volumen",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872284,
 *                 "key": "_pflichtprodukt",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872285,
 *                 "key": "_subscription_one_time_shipping",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872286,
 *                 "key": "_subscription_payment_sync_date",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872287,
 *                 "key": "_subscription_limit",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872288,
 *                 "key": "_wpas_done_all",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872289,
 *                 "key": "_stock_cachetime",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872290,
 *                 "key": "box_shortcode",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872291,
 *                 "key": "_min_max_variation_ids_hash",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872292,
 *                 "key": "_min_price_variation_id",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872293,
 *                 "key": "_max_price_variation_id",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872294,
 *                 "key": "_min_variation_price",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872295,
 *                 "key": "_max_variation_price",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872296,
 *                 "key": "_min_variation_regular_price",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872297,
 *                 "key": "_max_variation_regular_price",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872298,
 *                 "key": "_min_variation_sale_price",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872299,
 *                 "key": "_max_variation_sale_price",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872300,
 *                 "key": "_min_variation_period",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872301,
 *                 "key": "_max_variation_period",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872302,
 *                 "key": "_min_variation_period_interval",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872303,
 *                 "key": "_max_variation_period_interval",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872304,
 *                 "key": "_subscription_price",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872305,
 *                 "key": "_subscription_period",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872306,
 *                 "key": "_subscription_period_interval",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872307,
 *                 "key": "_subscription_sign_up_fee",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872308,
 *                 "key": "_subscription_trial_period",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872309,
 *                 "key": "_subscription_trial_length",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872310,
 *                 "key": "_subscription_length",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 872311,
 *                 "key": "bexio_account_product",
 *                 "value": ""
 *             },
 *             {
 *                 "id": 1039370,
 *                 "key": "_woocommerce_pos_uuid",
 *                 "value": "d75764de-1b03-4483-bfef-bca4c5ea7050"
 *             }
 *         ],
 *         "stock_status": "instock",
 *         "has_options": false,
 *         "post_password": "",
 *         "jetpack_sharing_enabled": true,
 *         "_links": {
 *             "self": [
 *                 {
 *                     "href": "https:\/\/quartierdepot-april2024.local\/wp-json\/wc\/v3\/products\/22801"
 *                 }
 *             ],
 *             "collection": [
 *                 {
 *                     "href": "https:\/\/quartierdepot-april2024.local\/wp-json\/wc\/v3\/products"
 *                 }
 *             ]
 *         }
 *     },
 */