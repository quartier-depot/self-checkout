import { Page } from '@playwright/test';

let customerId = 1000;
let orderId = 3000;


// Softdrinks (no barcode)
const softdrinks = [
  product({
    id: 101,
    name: 'Cola',
    price: 1,
    articleId: 'S01',
    category: 'S - Softdrinks',
    barcodes: [],
    freitext: '',
  }),
  product({
    id: 102,
    name: 'Eistee',
    price: 2,
    articleId: 'S02',
    category: 'S - Softdrinks',
    barcodes: [],
    freitext: '',
  }),
];

// Pasta (no barcode, many products)
const pasta = [...(
  ['Spaghetti', 'Penne', 'Fettuccine', 'Rigatoni', 'Fusilli', 'Linguine', 'Pappardelle', 'Orecchiette', 'Conchiglie', 'Bucatini', 'Rotini', 'Cavatappi', 'Macaroni', 'Tagliatelle', 'Gemelli', 'Campanelle', 'Paccheri', 'Ravioli', 'Tortellini']
    .map((name, index) =>
      product({
        id: 200 + index,
        name,
        price: 1 + index / 10,
        articleId: `P${(index + 1).toString().padStart(2, '0')}`,
        category: 'P - Pasta',
        barcodes: ['KEIN BARCODE'],
        freitext: '',
      })))];

// Vegetables (bulk item, weighted barcode, muliple barcodes)
export const vegetables = [
  product({
    id: 301,
    name: 'Salat',
    price: 0.1,
    articleId: 'G01',
    category: 'G - Gemüse',
    barcodes: ['1234567890301'],
    freitext: 'pro g',
  }),
  product({
    id: 302,
    name: 'Spinat',
    price: 0.2,
    articleId: 'G02',
    category: 'G - Gemüse',
    barcodes: ['1234567890302'],
    freitext: '',
  }),
  product({
    id: 303,
    name: 'Erbsen',
    price: 0.2,
    articleId: 'G02',
    category: 'G - Gemüse',
    barcodes: ['12345678wwwwc'],
    freitext: '',
  }),
];

// Fruits (simple barcode)
const fruits = [
  product({
    id: 401,
    name: 'Apfel',
    price: 1,
    articleId: 'F01',
    category: 'F - Früchte',
    barcodes: ['1234567890401'],
    freitext: '',
  }),
  product({
    id: 402,
    name: 'Birne',
    price: 2,
    articleId: 'F02',
    category: 'F - Früchte',
    barcodes: ['1234567890402'],
    freitext: '',
  }),
];

// Customers
export const customers = [
  customer('Alberto', 'Acosta'),
  customer('Branson', 'Boyd'),
];

export async function mockWoocommerce(page: Page) {

  await page.route('**/wp-json/wc/v3/products**', async (route, request) => {
    const url = new URL(request.url());
    const page = url.searchParams.get('page');
    const headers: { [key: string]: string; } = {};
    headers['x-wp-totalpages'] = '2';

    let products = [];
    switch (page) {
      case '1': {
        products = [
          ...softdrinks,
          ...pasta,
        ];
        break;
      }
      case '2': {
        products = [
          ...vegetables,
          ...fruits,
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
    const headers: { [key: string]: string; } = {};
    headers['x-wp-totalpages'] = '1';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(customers),
      headers: headers,
    });
  });

  await page.route('**/wp-json/wc/v3/orders**', async route => {
    switch (route.request().method()) {
      case 'GET':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            order(customers[0], [pasta[1], vegetables[1], fruits[1], softdrinks[1]]),
          ]),
        });
        break;

      case 'POST':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            newOrder('processing', await route.request().postDataJSON()),
          ),
        });
        break;

      case 'PUT':
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            newOrder('completed', await route.request().postDataJSON()),
          ]),
        });
        break;
    }
  });

  await page.route('**/wp-json/wc/v3/orders/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        newOrder('completed', await route.request().postDataJSON()),
      ),
    });
  });

  await page.route('**/wp-json/wc/v3/wallet/balance**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ balance: '42.00', currency: 'CHF' }),
    });
  });

  await page.route('**/wp-json/wc/v3/wallet', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: '#walletTransactionId', response: 'success' }),
    });
  });

  await page.route('**/wp-json/wc/v3/ondemand/pick-up', async route => {
    const response = {
      generated: '2025-12-22',
      lists: [
        {
          id: 1,
          title: 'Weekly preorder',
          description: 'Description weekly',
          delivery: '2025-12-19',
          customers: [
            {
              customer_id: customers[0].id,
              preorders: [{ 'product_id': fruits[0].id, 'amount': 10 }],
            },
          ],
        },
        {
          id: 2,
          title: 'One off preorder',
          description: 'Description one off',
          delivery: '2025-12-22',
          customers: [
            {
              customer_id: customers[0].id,
              preorders: [{ 'product_id': pasta[0].id, 'amount': 1 }],
            },
          ],
        },
      ],
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });

}

function customer(firstName: string, lastName: string) {
  const id = customerId++;
  return {
    id,
    email: `${id}@test.com`,
    first_name: firstName,
    last_name: lastName,
    role: 'customer',
    username: `${id}-Username`,
    shipping: {},
    billing: {},
    meta_data: [
      { id: 1000 + id, key: 'member_id', 'value': memberIdFor(id) },
      {
        id: 1100 + id,
        key: 'passkey_id',
        value: 'passkey_id_value',
      },
      {
        id: 1200 + id,
        key: 'google_wallet_token',
        'value': 'google_wallet_token_value',
      },
    ],
    acf: {
      member_id: memberIdFor(id),
      passkey_id: 'passkey_id_value',
      google_wallet_token: 'google_wallet_token_value',
    },
  };
}

export function memberIdFor(id: number) {
  return `M000000${id}`;
}

/**
 * {
 *   "id": 213,
 *   "date_created": "2024-12-18T13:46:20",
 *   "date_created_gmt": "2024-12-18T12:46:20",
 *   "date_modified": "2025-12-22T10:17:37",
 *   "date_modified_gmt": "2025-12-22T09:17:37",
 *   "email": "christian+kunde@abegg.rocks",
 *   "first_name": "Jenifer",
 *   "last_name": "Campbell",
 *   "role": "customer",
 *   "username": "kunde",
 *   "billing": {
 *     "first_name": "Jennifer",
 *     "last_name": "Campbell",
 *     "company": "Quartierdepot",
 *     "address_1": "R\u00f6telstrasse 126",
 *     "address_2": "",
 *     "city": "Z\u00fcrich",
 *     "postcode": "8057",
 *     "country": "CH",
 *     "state": "ZH",
 *     "email": "christian+kunde@abegg.rocks",
 *     "phone": ""
 *   },
 *   "shipping": {
 *     "first_name": "Jennifer",
 *     "last_name": "Campbell",
 *     "company": "Quartierdepot",
 *     "address_1": "R\u00f6telstrasse 126",
 *     "address_2": "",
 *     "city": "Z\u00fcrich",
 *     "postcode": "8057",
 *     "country": "CH",
 *     "state": "ZH",
 *     "phone": ""
 *   },
 *   "is_paying_customer": true,
 *   "avatar_url": "https://secure.gravatar.com/avatar/c4d32e7940acab5436dbfaa84958fdd5?s=96&d=mm&r=g",
 *   "meta_data": [
 *     { "id": 47716, "key": "_wcs_subscription_ids_cache", "value": [] },
 *     {
 *       "id": 47735,
 *       "key": "_woocommerce_pos_uuid",
 *       "value": "521adc9e-626a-447e-81f0-3ba5bc39cb2c"
 *     },
 *     { "id": 47737, "key": "wc_last_active", "value": "1766361600" },
 *     { "id": 47744, "key": "_current_woo_wallet_balance", "value": "1038.92" },
 *     { "id": 47745, "key": "genesis_admin_menu", "value": "1" },
 *     { "id": 47746, "key": "genesis_seo_settings_menu", "value": "1" },
 *     { "id": 47747, "key": "genesis_import_export_menu", "value": "1" },
 *     { "id": 47748, "key": "genesis_author_box_single", "value": "" },
 *     { "id": 47749, "key": "genesis_author_box_archive", "value": "" },
 *     { "id": 47750, "key": "headline", "value": "" },
 *     { "id": 47751, "key": "intro_text", "value": "" },
 *     { "id": 47752, "key": "doctitle", "value": "" },
 *     { "id": 47753, "key": "meta_description", "value": "" },
 *     { "id": 47754, "key": "meta_keywords", "value": "" },
 *     { "id": 47755, "key": "noindex", "value": "" },
 *     { "id": 47756, "key": "nofollow", "value": "" },
 *     { "id": 47757, "key": "noarchive", "value": "" },
 *     { "id": 47758, "key": "layout", "value": "" },
 *     { "id": 47820, "key": "member_id", "value": "M4347854992" },
 *     { "id": 47821, "key": "_member_id", "value": "field_679a100015728" },
 *     {
 *       "id": 47935,
 *       "key": "passkey_id",
 *       "value": "2aa6e9e6-98aa-46c0-9d7a-2920dc789d3b"
 *     },
 *     { "id": 47936, "key": "_passkey_id", "value": "field_68b849a85d6e0" },
 *     {
 *       "id": 47946,
 *       "key": "google_wallet_token",
 *       "value": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJxdWFydGllcmRlcG90LWdvb2dsZS13YWxsZXRAcXVhcnRpZXJkZXBvdC1mdW5jdGlvbi5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsImF1ZCI6Imdvb2dsZSIsIm9yaWdpbnMiOltdLCJ0eXAiOiJzYXZldG93YWxsZXQiLCJwYXlsb2FkIjp7ImdlbmVyaWNDbGFzc2VzIjpbeyJpZCI6IjMzODgwMDAwMDAwMjMwMDkwNjYucGFzcy5jaC5xdWFydGllci1kZXBvdCJ9XSwiZ2VuZXJpY09iamVjdHMiOlt7ImJhcmNvZGUiOnsiYWx0ZXJuYXRlVGV4dCI6Ik00MzQ3ODU0OTkyIiwidHlwZSI6IkNPREVfMTI4IiwidmFsdWUiOiJNNDM0Nzg1NDk5MiJ9LCJjYXJkVGl0bGUiOnsiZGVmYXVsdFZhbHVlIjp7Imxhbmd1YWdlIjoiZGUtQ0giLCJ2YWx1ZSI6IlF1YXJ0aWVyIERlcG90In19LCJjbGFzc0lkIjoiMzM4ODAwMDAwMDAyMzAwOTA2Ni5wYXNzLmNoLnF1YXJ0aWVyLWRlcG90IiwiaGVhZGVyIjp7ImRlZmF1bHRWYWx1ZSI6eyJsYW5ndWFnZSI6ImRlLUNIIiwidmFsdWUiOiJLdW5kZSBLdW5kZSJ9fSwiaGVyb0ltYWdlIjp7ImNvbnRlbnREZXNjcmlwdGlvbiI6eyJkZWZhdWx0VmFsdWUiOnsibGFuZ3VhZ2UiOiJkZS1DSCIsInZhbHVlIjoiUXVhcnRpZXIgRGVwb3QifX0sInNvdXJjZVVyaSI6eyJ1cmkiOiJodHRwczovL3F1YXJ0aWVyZGVwb3QuYmxvYi5jb3JlLndpbmRvd3MubmV0L2Fzc2V0cy9zdHJpcEAyeC5wbmcifX0sImhleEJhY2tncm91bmRDb2xvciI6IiMxNTZjNmYiLCJpZCI6IjMzODgwMDAwMDAwMjMwMDkwNjYuMmFhNmU5ZTYtOThhYS00NmMwLTlkN2EtMjkyMGRjNzg5ZDNiIiwibG9nbyI6eyJjb250ZW50RGVzY3JpcHRpb24iOnsiZGVmYXVsdFZhbHVlIjp7Imxhbmd1YWdlIjoiZGUtQ0giLCJ2YWx1ZSI6IlF1YXJ0aWVyIERlcG90In19LCJzb3VyY2VVcmkiOnsidXJpIjoiaHR0cHM6Ly9xdWFydGllcmRlcG90LmJsb2IuY29yZS53aW5kb3dzLm5ldC9hc3NldHMvbG9nb0AyeC5wbmcifX0sInN0YXRlIjoiQUNUSVZFIiwic3ViaGVhZGVyIjp7ImRlZmF1bHRWYWx1ZSI6eyJsYW5ndWFnZSI6ImRlLUNIIiwidmFsdWUiOiJOYW1lIn19fV19fQ.hId_OEYSOJKCKMeo8dK8gXWhagsEuojxanR795iJlWRBRRojXrhT1w2tEMVnxMYHhnIdpPB6C5NBcGj-uWnbQq-fUr8Nl3xFli-DPhGhWxqGd7qxo4KLTJkSeCrxi5OrDjmHe3lVFzz7hMZaBe5BugM1kKFen-gLuSHR5q91jWo9_CfKoEwldzoq3FN3DeLdKvshgDAJQuBr1W7sq7h--kp1Hufi83nYGpwIhr2XJlTWxFfkl29JxczI4OjgpmG9w5s_jWQz20nGM3unwo91k4Ffc4AAOGsn9SNmlzmPzqX4TJ9DDfknPYntfPkceRM5qfJ_BnIcXmNi0y8QA82xCQ"
 *     },
 *     {
 *       "id": 47947,
 *       "key": "_google_wallet_token",
 *       "value": "field_68c12cc1e8e2f"
 *     }
 *   ],
 *   "acf": {
 *     "member_id": "M4347854992",
 *     "passkey_id": "2aa6e9e6-98aa-46c0-9d7a-2920dc789d3b",
 *     "google_wallet_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJxdWFydGllcmRlcG90LWdvb2dsZS13YWxsZXRAcXVhcnRpZXJkZXBvdC1mdW5jdGlvbi5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsImF1ZCI6Imdvb2dsZSIsIm9yaWdpbnMiOltdLCJ0eXAiOiJzYXZldG93YWxsZXQiLCJwYXlsb2FkIjp7ImdlbmVyaWNDbGFzc2VzIjpbeyJpZCI6IjMzODgwMDAwMDAwMjMwMDkwNjYucGFzcy5jaC5xdWFydGllci1kZXBvdCJ9XSwiZ2VuZXJpY09iamVjdHMiOlt7ImJhcmNvZGUiOnsiYWx0ZXJuYXRlVGV4dCI6Ik00MzQ3ODU0OTkyIiwidHlwZSI6IkNPREVfMTI4IiwidmFsdWUiOiJNNDM0Nzg1NDk5MiJ9LCJjYXJkVGl0bGUiOnsiZGVmYXVsdFZhbHVlIjp7Imxhbmd1YWdlIjoiZGUtQ0giLCJ2YWx1ZSI6IlF1YXJ0aWVyIERlcG90In19LCJjbGFzc0lkIjoiMzM4ODAwMDAwMDAyMzAwOTA2Ni5wYXNzLmNoLnF1YXJ0aWVyLWRlcG90IiwiaGVhZGVyIjp7ImRlZmF1bHRWYWx1ZSI6eyJsYW5ndWFnZSI6ImRlLUNIIiwidmFsdWUiOiJLdW5kZSBLdW5kZSJ9fSwiaGVyb0ltYWdlIjp7ImNvbnRlbnREZXNjcmlwdGlvbiI6eyJkZWZhdWx0VmFsdWUiOnsibGFuZ3VhZ2UiOiJkZS1DSCIsInZhbHVlIjoiUXVhcnRpZXIgRGVwb3QifX0sInNvdXJjZVVyaSI6eyJ1cmkiOiJodHRwczovL3F1YXJ0aWVyZGVwb3QuYmxvYi5jb3JlLndpbmRvd3MubmV0L2Fzc2V0cy9zdHJpcEAyeC5wbmcifX0sImhleEJhY2tncm91bmRDb2xvciI6IiMxNTZjNmYiLCJpZCI6IjMzODgwMDAwMDAwMjMwMDkwNjYuMmFhNmU5ZTYtOThhYS00NmMwLTlkN2EtMjkyMGRjNzg5ZDNiIiwibG9nbyI6eyJjb250ZW50RGVzY3JpcHRpb24iOnsiZGVmYXVsdFZhbHVlIjp7Imxhbmd1YWdlIjoiZGUtQ0giLCJ2YWx1ZSI6IlF1YXJ0aWVyIERlcG90In19LCJzb3VyY2VVcmkiOnsidXJpIjoiaHR0cHM6Ly9xdWFydGllcmRlcG90LmJsb2IuY29yZS53aW5kb3dzLm5ldC9hc3NldHMvbG9nb0AyeC5wbmcifX0sInN0YXRlIjoiQUNUSVZFIiwic3ViaGVhZGVyIjp7ImRlZmF1bHRWYWx1ZSI6eyJsYW5ndWFnZSI6ImRlLUNIIiwidmFsdWUiOiJOYW1lIn19fV19fQ.hId_OEYSOJKCKMeo8dK8gXWhagsEuojxanR795iJlWRBRRojXrhT1w2tEMVnxMYHhnIdpPB6C5NBcGj-uWnbQq-fUr8Nl3xFli-DPhGhWxqGd7qxo4KLTJkSeCrxi5OrDjmHe3lVFzz7hMZaBe5BugM1kKFen-gLuSHR5q91jWo9_CfKoEwldzoq3FN3DeLdKvshgDAJQuBr1W7sq7h--kp1Hufi83nYGpwIhr2XJlTWxFfkl29JxczI4OjgpmG9w5s_jWQz20nGM3unwo91k4Ffc4AAOGsn9SNmlzmPzqX4TJ9DDfknPYntfPkceRM5qfJ_BnIcXmNi0y8QA82xCQ"
 *   },
 *   "_links": {
 *     "self": [
 *       {
 *         "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/213"
 *       }
 *     ],
 *     "collection": [
 *       {
 *         "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers"
 *       }
 *     ]
 *   }
 * }
 */

function product({ id, name, price, articleId, category, barcodes }: {
  id: number;
  name: string;
  price: number;
  articleId: string;
  category: string;
  barcodes: string[];
  freitext: string
}) {
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

function order(customer: any, products: any[]) {
  return {
    id: orderId++,
    customer_id: customer.id,
    status: 'completed',
    billing: customer.billing,
    shipping: customer.shipping,
    line_items: products.map(product => ({ product_id: product.id, quantity: 1 })),
  };
}

function newOrder(status: string, body: any) {
  return {
    ...body,
    id: '1230321',
    status,
    total: '42.00',
    transaction_id: '#payrexxTransactionId',
  };
}

/**
 * [
 *   {
 *     "id": 30282,
 *     "parent_id": 0,
 *     "status": "processing",
 *     "currency": "CHF",
 *     "version": "8.7.0",
 *     "prices_include_tax": true,
 *     "date_created": "2025-12-21T12:40:25",
 *     "date_modified": "2025-12-21T12:40:25",
 *     "discount_total": "0.00",
 *     "discount_tax": "0.00",
 *     "shipping_total": "0.00",
 *     "shipping_tax": "0.00",
 *     "cart_tax": "0.13",
 *     "total": "5.20",
 *     "total_tax": "0.13",
 *     "customer_id": 213,
 *     "order_key": "wc_order_mntO9nca4V544",
 *     "billing": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "email": "christian+kunde@abegg.rocks",
 *       "phone": ""
 *     },
 *     "shipping": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "phone": ""
 *     },
 *     "payment_method": "",
 *     "payment_method_title": "",
 *     "transaction_id": "",
 *     "customer_ip_address": "",
 *     "customer_user_agent": "",
 *     "created_via": "rest-api",
 *     "customer_note": "",
 *     "date_completed": null,
 *     "date_paid": "2025-12-21T12:40:25",
 *     "cart_hash": "",
 *     "number": "30282",
 *     "meta_data": [],
 *     "line_items": [
 *       {
 *         "id": 92970,
 *         "name": "R\u00fcebli zum Gem\u00fcseabo",
 *         "product_id": 28817,
 *         "variation_id": 0,
 *         "quantity": 1,
 *         "tax_class": "mwst-reduzierter-satz",
 *         "subtotal": "5.07",
 *         "subtotal_tax": "0.13",
 *         "total": "5.07",
 *         "total_tax": "0.13",
 *         "taxes": [{ "id": 4, "total": "0.131774", "subtotal": "0.131774" }],
 *         "meta_data": [
 *           {
 *             "id": 852324,
 *             "key": "_price_without_tax",
 *             "value": "5.068226",
 *             "display_key": "_price_without_tax",
 *             "display_value": "5.068226"
 *           },
 *           {
 *             "id": 852325,
 *             "key": "_price_with_tax",
 *             "value": "5.2",
 *             "display_key": "_price_with_tax",
 *             "display_value": "5.2"
 *           }
 *         ],
 *         "sku": "",
 *         "price": 5.0682260000000001,
 *         "image": { "id": "", "src": "" },
 *         "parent_name": null
 *       }
 *     ],
 *     "tax_lines": [
 *       {
 *         "id": 92971,
 *         "rate_code": "CH-ZH-MWST. REDUZIERTER SATZ-1",
 *         "rate_id": 4,
 *         "label": "MwSt. reduzierter Satz",
 *         "compound": false,
 *         "tax_total": "0.13",
 *         "shipping_tax_total": "0.00",
 *         "rate_percent": 2.6000000000000001,
 *         "meta_data": []
 *       }
 *     ],
 *     "shipping_lines": [],
 *     "fee_lines": [],
 *     "coupon_lines": [],
 *     "refunds": [],
 *     "payment_url": "https://quartierdepot-april2024.local/kasse/bezahlen/30282/?pay_for_order=true&key=wc_order_mntO9nca4V544",
 *     "is_editable": false,
 *     "needs_payment": false,
 *     "needs_processing": true,
 *     "date_created_gmt": "2025-12-21T11:40:25",
 *     "date_modified_gmt": "2025-12-21T11:40:25",
 *     "date_completed_gmt": null,
 *     "date_paid_gmt": "2025-12-21T11:40:25",
 *     "currency_symbol": "CHF",
 *     "_links": {
 *       "self": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders/30282"
 *         }
 *       ],
 *       "collection": [
 *         { "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders" }
 *       ],
 *       "customer": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/213"
 *         }
 *       ]
 *     }
 *   },
 *   {
 *     "id": 30281,
 *     "parent_id": 0,
 *     "status": "processing",
 *     "currency": "CHF",
 *     "version": "8.7.0",
 *     "prices_include_tax": true,
 *     "date_created": "2025-12-21T12:37:15",
 *     "date_modified": "2025-12-21T12:37:15",
 *     "discount_total": "0.00",
 *     "discount_tax": "0.00",
 *     "shipping_total": "0.00",
 *     "shipping_tax": "0.00",
 *     "cart_tax": "0.13",
 *     "total": "5.20",
 *     "total_tax": "0.13",
 *     "customer_id": 213,
 *     "order_key": "wc_order_Ciasi4ZG1E87F",
 *     "billing": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "email": "christian+kunde@abegg.rocks",
 *       "phone": ""
 *     },
 *     "shipping": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "phone": ""
 *     },
 *     "payment_method": "",
 *     "payment_method_title": "",
 *     "transaction_id": "",
 *     "customer_ip_address": "",
 *     "customer_user_agent": "",
 *     "created_via": "rest-api",
 *     "customer_note": "",
 *     "date_completed": null,
 *     "date_paid": "2025-12-21T12:37:15",
 *     "cart_hash": "",
 *     "number": "30281",
 *     "meta_data": [],
 *     "line_items": [
 *       {
 *         "id": 92968,
 *         "name": "R\u00fcebli zum Gem\u00fcseabo",
 *         "product_id": 28817,
 *         "variation_id": 0,
 *         "quantity": 1,
 *         "tax_class": "mwst-reduzierter-satz",
 *         "subtotal": "5.07",
 *         "subtotal_tax": "0.13",
 *         "total": "5.07",
 *         "total_tax": "0.13",
 *         "taxes": [{ "id": 4, "total": "0.131774", "subtotal": "0.131774" }],
 *         "meta_data": [
 *           {
 *             "id": 852307,
 *             "key": "_price_without_tax",
 *             "value": "5.068226",
 *             "display_key": "_price_without_tax",
 *             "display_value": "5.068226"
 *           },
 *           {
 *             "id": 852308,
 *             "key": "_price_with_tax",
 *             "value": "5.2",
 *             "display_key": "_price_with_tax",
 *             "display_value": "5.2"
 *           }
 *         ],
 *         "sku": "",
 *         "price": 5.0682260000000001,
 *         "image": { "id": "", "src": "" },
 *         "parent_name": null
 *       }
 *     ],
 *     "tax_lines": [
 *       {
 *         "id": 92969,
 *         "rate_code": "CH-ZH-MWST. REDUZIERTER SATZ-1",
 *         "rate_id": 4,
 *         "label": "MwSt. reduzierter Satz",
 *         "compound": false,
 *         "tax_total": "0.13",
 *         "shipping_tax_total": "0.00",
 *         "rate_percent": 2.6000000000000001,
 *         "meta_data": []
 *       }
 *     ],
 *     "shipping_lines": [],
 *     "fee_lines": [],
 *     "coupon_lines": [],
 *     "refunds": [],
 *     "payment_url": "https://quartierdepot-april2024.local/kasse/bezahlen/30281/?pay_for_order=true&key=wc_order_Ciasi4ZG1E87F",
 *     "is_editable": false,
 *     "needs_payment": false,
 *     "needs_processing": true,
 *     "date_created_gmt": "2025-12-21T11:37:15",
 *     "date_modified_gmt": "2025-12-21T11:37:15",
 *     "date_completed_gmt": null,
 *     "date_paid_gmt": "2025-12-21T11:37:15",
 *     "currency_symbol": "CHF",
 *     "_links": {
 *       "self": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders/30281"
 *         }
 *       ],
 *       "collection": [
 *         { "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders" }
 *       ],
 *       "customer": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/213"
 *         }
 *       ]
 *     }
 *   },
 *   {
 *     "id": 30280,
 *     "parent_id": 0,
 *     "status": "completed",
 *     "currency": "CHF",
 *     "version": "8.7.0",
 *     "prices_include_tax": true,
 *     "date_created": "2025-12-21T12:36:00",
 *     "date_modified": "2025-12-21T12:36:13",
 *     "discount_total": "0.00",
 *     "discount_tax": "0.00",
 *     "shipping_total": "0.00",
 *     "shipping_tax": "0.00",
 *     "cart_tax": "0.13",
 *     "total": "5.20",
 *     "total_tax": "0.13",
 *     "customer_id": 213,
 *     "order_key": "wc_order_nE98iEviPJBJy",
 *     "billing": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "email": "christian+kunde@abegg.rocks",
 *       "phone": ""
 *     },
 *     "shipping": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "phone": ""
 *     },
 *     "payment_method": "wallet",
 *     "payment_method_title": "Virtuelles Konto",
 *     "transaction_id": "10721",
 *     "customer_ip_address": "",
 *     "customer_user_agent": "",
 *     "created_via": "rest-api",
 *     "customer_note": "",
 *     "date_completed": "2025-12-21T12:36:13",
 *     "date_paid": "2025-12-21T12:36:00",
 *     "cart_hash": "",
 *     "number": "30280",
 *     "meta_data": [
 *       { "id": 1051799, "key": "_bexio_order_id", "value": "1577" },
 *       { "id": 1051800, "key": "_bexio_order_nr", "value": "AU-01577" },
 *       { "id": 1051801, "key": "_bexio_delivery_id", "value": "1575" },
 *       { "id": 1051802, "key": "_bexio_delivery_nr", "value": "LS-01575" },
 *       { "id": 1051803, "key": "_bexio_invoice_id", "value": "1344" },
 *       { "id": 1051804, "key": "_bexio_invoice_nr", "value": "RE-01344" },
 *       { "id": 1051805, "key": "_bexio_invoice_issued", "value": "1" },
 *       { "id": 1051808, "key": "_bexio_invoice_paid", "value": "1" },
 *       { "id": 1051810, "key": "_bexio_delivery_issued", "value": "1" }
 *     ],
 *     "line_items": [
 *       {
 *         "id": 92966,
 *         "name": "R\u00fcebli zum Gem\u00fcseabo",
 *         "product_id": 28817,
 *         "variation_id": 0,
 *         "quantity": 1,
 *         "tax_class": "mwst-reduzierter-satz",
 *         "subtotal": "5.07",
 *         "subtotal_tax": "0.13",
 *         "total": "5.07",
 *         "total_tax": "0.13",
 *         "taxes": [{ "id": 4, "total": "0.131774", "subtotal": "0.131774" }],
 *         "meta_data": [
 *           {
 *             "id": 852290,
 *             "key": "_price_without_tax",
 *             "value": "5.068226",
 *             "display_key": "_price_without_tax",
 *             "display_value": "5.068226"
 *           },
 *           {
 *             "id": 852291,
 *             "key": "_price_with_tax",
 *             "value": "5.2",
 *             "display_key": "_price_with_tax",
 *             "display_value": "5.2"
 *           }
 *         ],
 *         "sku": "",
 *         "price": 5.0682260000000001,
 *         "image": { "id": "", "src": "" },
 *         "parent_name": null
 *       }
 *     ],
 *     "tax_lines": [
 *       {
 *         "id": 92967,
 *         "rate_code": "CH-ZH-MWST. REDUZIERTER SATZ-1",
 *         "rate_id": 4,
 *         "label": "MwSt. reduzierter Satz",
 *         "compound": false,
 *         "tax_total": "0.13",
 *         "shipping_tax_total": "0.00",
 *         "rate_percent": 2.6000000000000001,
 *         "meta_data": []
 *       }
 *     ],
 *     "shipping_lines": [],
 *     "fee_lines": [],
 *     "coupon_lines": [],
 *     "refunds": [],
 *     "payment_url": "https://quartierdepot-april2024.local/kasse/bezahlen/30280/?pay_for_order=true&key=wc_order_nE98iEviPJBJy",
 *     "is_editable": false,
 *     "needs_payment": false,
 *     "needs_processing": true,
 *     "date_created_gmt": "2025-12-21T11:36:00",
 *     "date_modified_gmt": "2025-12-21T11:36:13",
 *     "date_completed_gmt": "2025-12-21T11:36:13",
 *     "date_paid_gmt": "2025-12-21T11:36:00",
 *     "currency_symbol": "CHF",
 *     "_links": {
 *       "self": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders/30280"
 *         }
 *       ],
 *       "collection": [
 *         { "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders" }
 *       ],
 *       "customer": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/213"
 *         }
 *       ]
 *     }
 *   },
 *   {
 *     "id": 30279,
 *     "parent_id": 0,
 *     "status": "processing",
 *     "currency": "CHF",
 *     "version": "8.7.0",
 *     "prices_include_tax": true,
 *     "date_created": "2025-12-21T12:30:33",
 *     "date_modified": "2025-12-21T12:30:34",
 *     "discount_total": "0.00",
 *     "discount_tax": "0.00",
 *     "shipping_total": "0.00",
 *     "shipping_tax": "0.00",
 *     "cart_tax": "0.59",
 *     "total": "23.10",
 *     "total_tax": "0.59",
 *     "customer_id": 213,
 *     "order_key": "wc_order_5NyyIGC1sF9Xj",
 *     "billing": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "email": "christian+kunde@abegg.rocks",
 *       "phone": ""
 *     },
 *     "shipping": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "phone": ""
 *     },
 *     "payment_method": "",
 *     "payment_method_title": "",
 *     "transaction_id": "",
 *     "customer_ip_address": "",
 *     "customer_user_agent": "",
 *     "created_via": "rest-api",
 *     "customer_note": "",
 *     "date_completed": null,
 *     "date_paid": "2025-12-21T12:30:34",
 *     "cart_hash": "",
 *     "number": "30279",
 *     "meta_data": [],
 *     "line_items": [
 *       {
 *         "id": 92964,
 *         "name": "Gugelhopf Bratapfel, Sorbetto",
 *         "product_id": 28358,
 *         "variation_id": 0,
 *         "quantity": 1,
 *         "tax_class": "mwst-reduzierter-satz",
 *         "subtotal": "22.51",
 *         "subtotal_tax": "0.59",
 *         "total": "22.51",
 *         "total_tax": "0.59",
 *         "taxes": [{ "id": 4, "total": "0.58538", "subtotal": "0.58538" }],
 *         "meta_data": [
 *           {
 *             "id": 852273,
 *             "key": "_price_without_tax",
 *             "value": "22.51462",
 *             "display_key": "_price_without_tax",
 *             "display_value": "22.51462"
 *           },
 *           {
 *             "id": 852274,
 *             "key": "_price_with_tax",
 *             "value": "23.1",
 *             "display_key": "_price_with_tax",
 *             "display_value": "23.1"
 *           }
 *         ],
 *         "sku": "QD-0-0764",
 *         "price": 22.514620000000001,
 *         "image": { "id": "", "src": "" },
 *         "parent_name": null
 *       }
 *     ],
 *     "tax_lines": [
 *       {
 *         "id": 92965,
 *         "rate_code": "CH-ZH-MWST. REDUZIERTER SATZ-1",
 *         "rate_id": 4,
 *         "label": "MwSt. reduzierter Satz",
 *         "compound": false,
 *         "tax_total": "0.59",
 *         "shipping_tax_total": "0.00",
 *         "rate_percent": 2.6000000000000001,
 *         "meta_data": []
 *       }
 *     ],
 *     "shipping_lines": [],
 *     "fee_lines": [],
 *     "coupon_lines": [],
 *     "refunds": [],
 *     "payment_url": "https://quartierdepot-april2024.local/kasse/bezahlen/30279/?pay_for_order=true&key=wc_order_5NyyIGC1sF9Xj",
 *     "is_editable": false,
 *     "needs_payment": false,
 *     "needs_processing": true,
 *     "date_created_gmt": "2025-12-21T11:30:33",
 *     "date_modified_gmt": "2025-12-21T11:30:34",
 *     "date_completed_gmt": null,
 *     "date_paid_gmt": "2025-12-21T11:30:34",
 *     "currency_symbol": "CHF",
 *     "_links": {
 *       "self": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders/30279"
 *         }
 *       ],
 *       "collection": [
 *         { "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders" }
 *       ],
 *       "customer": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/213"
 *         }
 *       ]
 *     }
 *   },
 *   {
 *     "id": 30278,
 *     "parent_id": 0,
 *     "status": "completed",
 *     "currency": "CHF",
 *     "version": "8.7.0",
 *     "prices_include_tax": true,
 *     "date_created": "2025-12-21T11:58:23",
 *     "date_modified": "2025-12-21T11:58:27",
 *     "discount_total": "0.00",
 *     "discount_tax": "0.00",
 *     "shipping_total": "0.00",
 *     "shipping_tax": "0.00",
 *     "cart_tax": "0.59",
 *     "total": "23.10",
 *     "total_tax": "0.59",
 *     "customer_id": 214,
 *     "order_key": "wc_order_Tki8owxQCU3XY",
 *     "billing": {
 *       "first_name": "Johnny",
 *       "last_name": "Subscriber",
 *       "company": "",
 *       "address_1": "",
 *       "address_2": "",
 *       "city": "",
 *       "state": "",
 *       "postcode": "",
 *       "country": "",
 *       "email": "subscriber@info.ch",
 *       "phone": ""
 *     },
 *     "shipping": {
 *       "first_name": "",
 *       "last_name": "",
 *       "company": "",
 *       "address_1": "",
 *       "address_2": "",
 *       "city": "",
 *       "state": "",
 *       "postcode": "",
 *       "country": "",
 *       "phone": ""
 *     },
 *     "payment_method": "wallet",
 *     "payment_method_title": "Virtuelles Konto",
 *     "transaction_id": "10720",
 *     "customer_ip_address": "",
 *     "customer_user_agent": "",
 *     "created_via": "rest-api",
 *     "customer_note": "",
 *     "date_completed": "2025-12-21T11:58:27",
 *     "date_paid": "2025-12-21T11:58:23",
 *     "cart_hash": "",
 *     "number": "30278",
 *     "meta_data": [
 *       { "id": 1051709, "key": "_bexio_order_id", "value": "1576" },
 *       { "id": 1051710, "key": "_bexio_order_nr", "value": "AU-01576" },
 *       { "id": 1051711, "key": "_bexio_delivery_id", "value": "1574" },
 *       { "id": 1051712, "key": "_bexio_delivery_nr", "value": "LS-01574" },
 *       { "id": 1051713, "key": "_bexio_invoice_id", "value": "1343" },
 *       { "id": 1051714, "key": "_bexio_invoice_nr", "value": "RE-01343" },
 *       { "id": 1051715, "key": "_bexio_invoice_issued", "value": "1" },
 *       { "id": 1051718, "key": "_bexio_invoice_paid", "value": "1" },
 *       { "id": 1051720, "key": "_bexio_delivery_issued", "value": "1" }
 *     ],
 *     "line_items": [
 *       {
 *         "id": 92962,
 *         "name": "Gugelhopf Bratapfel, Sorbetto",
 *         "product_id": 28358,
 *         "variation_id": 0,
 *         "quantity": 1,
 *         "tax_class": "mwst-reduzierter-satz",
 *         "subtotal": "22.51",
 *         "subtotal_tax": "0.59",
 *         "total": "22.51",
 *         "total_tax": "0.59",
 *         "taxes": [{ "id": 4, "total": "0.58538", "subtotal": "0.58538" }],
 *         "meta_data": [
 *           {
 *             "id": 852256,
 *             "key": "_price_without_tax",
 *             "value": "22.51462",
 *             "display_key": "_price_without_tax",
 *             "display_value": "22.51462"
 *           },
 *           {
 *             "id": 852257,
 *             "key": "_price_with_tax",
 *             "value": "23.1",
 *             "display_key": "_price_with_tax",
 *             "display_value": "23.1"
 *           }
 *         ],
 *         "sku": "QD-0-0764",
 *         "price": 22.514620000000001,
 *         "image": { "id": "", "src": "" },
 *         "parent_name": null
 *       }
 *     ],
 *     "tax_lines": [
 *       {
 *         "id": 92963,
 *         "rate_code": "CH-ZH-MWST. REDUZIERTER SATZ-1",
 *         "rate_id": 4,
 *         "label": "MwSt. reduzierter Satz",
 *         "compound": false,
 *         "tax_total": "0.59",
 *         "shipping_tax_total": "0.00",
 *         "rate_percent": 2.6000000000000001,
 *         "meta_data": []
 *       }
 *     ],
 *     "shipping_lines": [],
 *     "fee_lines": [],
 *     "coupon_lines": [],
 *     "refunds": [],
 *     "payment_url": "https://quartierdepot-april2024.local/kasse/bezahlen/30278/?pay_for_order=true&key=wc_order_Tki8owxQCU3XY",
 *     "is_editable": false,
 *     "needs_payment": false,
 *     "needs_processing": true,
 *     "date_created_gmt": "2025-12-21T10:58:23",
 *     "date_modified_gmt": "2025-12-21T10:58:27",
 *     "date_completed_gmt": "2025-12-21T10:58:27",
 *     "date_paid_gmt": "2025-12-21T10:58:23",
 *     "currency_symbol": "CHF",
 *     "_links": {
 *       "self": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders/30278"
 *         }
 *       ],
 *       "collection": [
 *         { "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders" }
 *       ],
 *       "customer": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/214"
 *         }
 *       ]
 *     }
 *   },
 *   {
 *     "id": 30277,
 *     "parent_id": 0,
 *     "status": "processing",
 *     "currency": "CHF",
 *     "version": "8.7.0",
 *     "prices_include_tax": true,
 *     "date_created": "2025-12-21T11:56:35",
 *     "date_modified": "2025-12-21T11:56:35",
 *     "discount_total": "0.00",
 *     "discount_tax": "0.00",
 *     "shipping_total": "0.00",
 *     "shipping_tax": "0.00",
 *     "cart_tax": "0.59",
 *     "total": "23.10",
 *     "total_tax": "0.59",
 *     "customer_id": 214,
 *     "order_key": "wc_order_DFg0tsusvToQA",
 *     "billing": {
 *       "first_name": "Johnny",
 *       "last_name": "Subscriber",
 *       "company": "",
 *       "address_1": "",
 *       "address_2": "",
 *       "city": "",
 *       "state": "",
 *       "postcode": "",
 *       "country": "",
 *       "email": "subscriber@info.ch",
 *       "phone": ""
 *     },
 *     "shipping": {
 *       "first_name": "",
 *       "last_name": "",
 *       "company": "",
 *       "address_1": "",
 *       "address_2": "",
 *       "city": "",
 *       "state": "",
 *       "postcode": "",
 *       "country": "",
 *       "phone": ""
 *     },
 *     "payment_method": "",
 *     "payment_method_title": "",
 *     "transaction_id": "",
 *     "customer_ip_address": "",
 *     "customer_user_agent": "",
 *     "created_via": "rest-api",
 *     "customer_note": "",
 *     "date_completed": null,
 *     "date_paid": "2025-12-21T11:56:35",
 *     "cart_hash": "",
 *     "number": "30277",
 *     "meta_data": [],
 *     "line_items": [
 *       {
 *         "id": 92960,
 *         "name": "Gugelhopf Bratapfel, Sorbetto",
 *         "product_id": 28358,
 *         "variation_id": 0,
 *         "quantity": 1,
 *         "tax_class": "mwst-reduzierter-satz",
 *         "subtotal": "22.51",
 *         "subtotal_tax": "0.59",
 *         "total": "22.51",
 *         "total_tax": "0.59",
 *         "taxes": [{ "id": 4, "total": "0.58538", "subtotal": "0.58538" }],
 *         "meta_data": [
 *           {
 *             "id": 852239,
 *             "key": "_price_without_tax",
 *             "value": "22.51462",
 *             "display_key": "_price_without_tax",
 *             "display_value": "22.51462"
 *           },
 *           {
 *             "id": 852240,
 *             "key": "_price_with_tax",
 *             "value": "23.1",
 *             "display_key": "_price_with_tax",
 *             "display_value": "23.1"
 *           }
 *         ],
 *         "sku": "QD-0-0764",
 *         "price": 22.514620000000001,
 *         "image": { "id": "", "src": "" },
 *         "parent_name": null
 *       }
 *     ],
 *     "tax_lines": [
 *       {
 *         "id": 92961,
 *         "rate_code": "CH-ZH-MWST. REDUZIERTER SATZ-1",
 *         "rate_id": 4,
 *         "label": "MwSt. reduzierter Satz",
 *         "compound": false,
 *         "tax_total": "0.59",
 *         "shipping_tax_total": "0.00",
 *         "rate_percent": 2.6000000000000001,
 *         "meta_data": []
 *       }
 *     ],
 *     "shipping_lines": [],
 *     "fee_lines": [],
 *     "coupon_lines": [],
 *     "refunds": [],
 *     "payment_url": "https://quartierdepot-april2024.local/kasse/bezahlen/30277/?pay_for_order=true&key=wc_order_DFg0tsusvToQA",
 *     "is_editable": false,
 *     "needs_payment": false,
 *     "needs_processing": true,
 *     "date_created_gmt": "2025-12-21T10:56:35",
 *     "date_modified_gmt": "2025-12-21T10:56:35",
 *     "date_completed_gmt": null,
 *     "date_paid_gmt": "2025-12-21T10:56:35",
 *     "currency_symbol": "CHF",
 *     "_links": {
 *       "self": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders/30277"
 *         }
 *       ],
 *       "collection": [
 *         { "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders" }
 *       ],
 *       "customer": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/214"
 *         }
 *       ]
 *     }
 *   },
 *   {
 *     "id": 30276,
 *     "parent_id": 0,
 *     "status": "processing",
 *     "currency": "CHF",
 *     "version": "8.7.0",
 *     "prices_include_tax": true,
 *     "date_created": "2025-12-21T11:55:41",
 *     "date_modified": "2025-12-21T11:55:41",
 *     "discount_total": "0.00",
 *     "discount_tax": "0.00",
 *     "shipping_total": "0.00",
 *     "shipping_tax": "0.00",
 *     "cart_tax": "0.59",
 *     "total": "23.10",
 *     "total_tax": "0.59",
 *     "customer_id": 213,
 *     "order_key": "wc_order_F3Qy28TgDmmuG",
 *     "billing": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "email": "christian+kunde@abegg.rocks",
 *       "phone": ""
 *     },
 *     "shipping": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "phone": ""
 *     },
 *     "payment_method": "",
 *     "payment_method_title": "",
 *     "transaction_id": "",
 *     "customer_ip_address": "",
 *     "customer_user_agent": "",
 *     "created_via": "rest-api",
 *     "customer_note": "",
 *     "date_completed": null,
 *     "date_paid": "2025-12-21T11:55:41",
 *     "cart_hash": "",
 *     "number": "30276",
 *     "meta_data": [],
 *     "line_items": [
 *       {
 *         "id": 92958,
 *         "name": "Gugelhopf Bratapfel, Sorbetto",
 *         "product_id": 28358,
 *         "variation_id": 0,
 *         "quantity": 1,
 *         "tax_class": "mwst-reduzierter-satz",
 *         "subtotal": "22.51",
 *         "subtotal_tax": "0.59",
 *         "total": "22.51",
 *         "total_tax": "0.59",
 *         "taxes": [{ "id": 4, "total": "0.58538", "subtotal": "0.58538" }],
 *         "meta_data": [
 *           {
 *             "id": 852222,
 *             "key": "_price_without_tax",
 *             "value": "22.51462",
 *             "display_key": "_price_without_tax",
 *             "display_value": "22.51462"
 *           },
 *           {
 *             "id": 852223,
 *             "key": "_price_with_tax",
 *             "value": "23.1",
 *             "display_key": "_price_with_tax",
 *             "display_value": "23.1"
 *           }
 *         ],
 *         "sku": "QD-0-0764",
 *         "price": 22.514620000000001,
 *         "image": { "id": "", "src": "" },
 *         "parent_name": null
 *       }
 *     ],
 *     "tax_lines": [
 *       {
 *         "id": 92959,
 *         "rate_code": "CH-ZH-MWST. REDUZIERTER SATZ-1",
 *         "rate_id": 4,
 *         "label": "MwSt. reduzierter Satz",
 *         "compound": false,
 *         "tax_total": "0.59",
 *         "shipping_tax_total": "0.00",
 *         "rate_percent": 2.6000000000000001,
 *         "meta_data": []
 *       }
 *     ],
 *     "shipping_lines": [],
 *     "fee_lines": [],
 *     "coupon_lines": [],
 *     "refunds": [],
 *     "payment_url": "https://quartierdepot-april2024.local/kasse/bezahlen/30276/?pay_for_order=true&key=wc_order_F3Qy28TgDmmuG",
 *     "is_editable": false,
 *     "needs_payment": false,
 *     "needs_processing": true,
 *     "date_created_gmt": "2025-12-21T10:55:41",
 *     "date_modified_gmt": "2025-12-21T10:55:41",
 *     "date_completed_gmt": null,
 *     "date_paid_gmt": "2025-12-21T10:55:41",
 *     "currency_symbol": "CHF",
 *     "_links": {
 *       "self": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders/30276"
 *         }
 *       ],
 *       "collection": [
 *         { "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders" }
 *       ],
 *       "customer": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/213"
 *         }
 *       ]
 *     }
 *   },
 *   {
 *     "id": 30274,
 *     "parent_id": 0,
 *     "status": "completed",
 *     "currency": "CHF",
 *     "version": "8.7.0",
 *     "prices_include_tax": true,
 *     "date_created": "2025-12-10T20:39:53",
 *     "date_modified": "2025-12-10T20:40:28",
 *     "discount_total": "0.00",
 *     "discount_tax": "0.00",
 *     "shipping_total": "0.00",
 *     "shipping_tax": "0.00",
 *     "cart_tax": "0.42",
 *     "total": "16.69",
 *     "total_tax": "0.42",
 *     "customer_id": 213,
 *     "order_key": "wc_order_v04T7Mp1vpWpq",
 *     "billing": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "email": "christian+kunde@abegg.rocks",
 *       "phone": ""
 *     },
 *     "shipping": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "",
 *       "phone": ""
 *     },
 *     "payment_method": "",
 *     "payment_method_title": "",
 *     "transaction_id": "",
 *     "customer_ip_address": "",
 *     "customer_user_agent": "",
 *     "created_via": "rest-api",
 *     "customer_note": "",
 *     "date_completed": "2025-12-10T20:40:28",
 *     "date_paid": "2025-12-10T20:39:53",
 *     "cart_hash": "",
 *     "number": "30274",
 *     "meta_data": [
 *       { "id": 1051615, "key": "bankabgleichskontrolle", "value": "0" },
 *       {
 *         "id": 1051616,
 *         "key": "_bankabgleichskontrolle",
 *         "value": "field_60dce78647468"
 *       },
 *       { "id": 1051617, "key": "in_buchhaltung_ubertragen", "value": "0" },
 *       {
 *         "id": 1051618,
 *         "key": "_in_buchhaltung_ubertragen",
 *         "value": "field_60dce8e1a46f9"
 *       }
 *     ],
 *     "line_items": [
 *       {
 *         "id": 92956,
 *         "name": "Cassata Ice-Torte, Sorbetto, 350ml",
 *         "product_id": 19087,
 *         "variation_id": 0,
 *         "quantity": 1,
 *         "tax_class": "mwst-reduzierter-satz",
 *         "subtotal": "16.27",
 *         "subtotal_tax": "0.42",
 *         "total": "16.27",
 *         "total_tax": "0.42",
 *         "taxes": [{ "id": 4, "total": "0.422943", "subtotal": "0.422943" }],
 *         "meta_data": [
 *           {
 *             "id": 852205,
 *             "key": "_price_without_tax",
 *             "value": "16.267057",
 *             "display_key": "_price_without_tax",
 *             "display_value": "16.267057"
 *           },
 *           {
 *             "id": 852206,
 *             "key": "_price_with_tax",
 *             "value": "16.69",
 *             "display_key": "_price_with_tax",
 *             "display_value": "16.69"
 *           }
 *         ],
 *         "sku": "QD-0-0015",
 *         "price": 16.267057000000001,
 *         "image": { "id": "", "src": "" },
 *         "parent_name": null
 *       }
 *     ],
 *     "tax_lines": [
 *       {
 *         "id": 92957,
 *         "rate_code": "CH-ZH-MWST. REDUZIERTER SATZ-1",
 *         "rate_id": 4,
 *         "label": "MwSt. reduzierter Satz",
 *         "compound": false,
 *         "tax_total": "0.42",
 *         "shipping_tax_total": "0.00",
 *         "rate_percent": 2.6000000000000001,
 *         "meta_data": []
 *       }
 *     ],
 *     "shipping_lines": [],
 *     "fee_lines": [],
 *     "coupon_lines": [],
 *     "refunds": [],
 *     "payment_url": "https://quartierdepot-april2024.local/kasse/bezahlen/30274/?pay_for_order=true&key=wc_order_v04T7Mp1vpWpq",
 *     "is_editable": false,
 *     "needs_payment": false,
 *     "needs_processing": true,
 *     "date_created_gmt": "2025-12-10T19:39:53",
 *     "date_modified_gmt": "2025-12-10T19:40:28",
 *     "date_completed_gmt": "2025-12-10T19:40:28",
 *     "date_paid_gmt": "2025-12-10T19:39:53",
 *     "currency_symbol": "CHF",
 *     "_links": {
 *       "self": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders/30274"
 *         }
 *       ],
 *       "collection": [
 *         { "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders" }
 *       ],
 *       "customer": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/213"
 *         }
 *       ]
 *     }
 *   },
 *   {
 *     "id": 30273,
 *     "parent_id": 0,
 *     "status": "processing",
 *     "currency": "CHF",
 *     "version": "8.7.0",
 *     "prices_include_tax": true,
 *     "date_created": "2025-12-10T20:39:15",
 *     "date_modified": "2025-12-10T20:39:15",
 *     "discount_total": "0.00",
 *     "discount_tax": "0.00",
 *     "shipping_total": "0.00",
 *     "shipping_tax": "0.00",
 *     "cart_tax": "0.42",
 *     "total": "16.69",
 *     "total_tax": "0.42",
 *     "customer_id": 213,
 *     "order_key": "wc_order_l45ZrT2m5CCYE",
 *     "billing": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "email": "christian+kunde@abegg.rocks",
 *       "phone": ""
 *     },
 *     "shipping": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "phone": ""
 *     },
 *     "payment_method": "",
 *     "payment_method_title": "",
 *     "transaction_id": "",
 *     "customer_ip_address": "",
 *     "customer_user_agent": "",
 *     "created_via": "rest-api",
 *     "customer_note": "",
 *     "date_completed": null,
 *     "date_paid": "2025-12-10T20:39:15",
 *     "cart_hash": "",
 *     "number": "30273",
 *     "meta_data": [],
 *     "line_items": [
 *       {
 *         "id": 92954,
 *         "name": "Cassata Ice-Torte, Sorbetto, 350ml",
 *         "product_id": 19087,
 *         "variation_id": 0,
 *         "quantity": 1,
 *         "tax_class": "mwst-reduzierter-satz",
 *         "subtotal": "16.27",
 *         "subtotal_tax": "0.42",
 *         "total": "16.27",
 *         "total_tax": "0.42",
 *         "taxes": [{ "id": 4, "total": "0.422943", "subtotal": "0.422943" }],
 *         "meta_data": [
 *           {
 *             "id": 852188,
 *             "key": "_price_without_tax",
 *             "value": "16.267057",
 *             "display_key": "_price_without_tax",
 *             "display_value": "16.267057"
 *           },
 *           {
 *             "id": 852189,
 *             "key": "_price_with_tax",
 *             "value": "16.69",
 *             "display_key": "_price_with_tax",
 *             "display_value": "16.69"
 *           }
 *         ],
 *         "sku": "QD-0-0015",
 *         "price": 16.267057000000001,
 *         "image": { "id": "", "src": "" },
 *         "parent_name": null
 *       }
 *     ],
 *     "tax_lines": [
 *       {
 *         "id": 92955,
 *         "rate_code": "CH-ZH-MWST. REDUZIERTER SATZ-1",
 *         "rate_id": 4,
 *         "label": "MwSt. reduzierter Satz",
 *         "compound": false,
 *         "tax_total": "0.42",
 *         "shipping_tax_total": "0.00",
 *         "rate_percent": 2.6000000000000001,
 *         "meta_data": []
 *       }
 *     ],
 *     "shipping_lines": [],
 *     "fee_lines": [],
 *     "coupon_lines": [],
 *     "refunds": [],
 *     "payment_url": "https://quartierdepot-april2024.local/kasse/bezahlen/30273/?pay_for_order=true&key=wc_order_l45ZrT2m5CCYE",
 *     "is_editable": false,
 *     "needs_payment": false,
 *     "needs_processing": true,
 *     "date_created_gmt": "2025-12-10T19:39:15",
 *     "date_modified_gmt": "2025-12-10T19:39:15",
 *     "date_completed_gmt": null,
 *     "date_paid_gmt": "2025-12-10T19:39:15",
 *     "currency_symbol": "CHF",
 *     "_links": {
 *       "self": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders/30273"
 *         }
 *       ],
 *       "collection": [
 *         { "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders" }
 *       ],
 *       "customer": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/213"
 *         }
 *       ]
 *     }
 *   },
 *   {
 *     "id": 30272,
 *     "parent_id": 0,
 *     "status": "completed",
 *     "currency": "CHF",
 *     "version": "8.7.0",
 *     "prices_include_tax": true,
 *     "date_created": "2025-12-10T20:38:05",
 *     "date_modified": "2025-12-10T20:39:05",
 *     "discount_total": "0.00",
 *     "discount_tax": "0.00",
 *     "shipping_total": "0.00",
 *     "shipping_tax": "0.00",
 *     "cart_tax": "0.42",
 *     "total": "16.69",
 *     "total_tax": "0.42",
 *     "customer_id": 213,
 *     "order_key": "wc_order_MhNrgvSaYl40p",
 *     "billing": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "CH",
 *       "email": "christian+kunde@abegg.rocks",
 *       "phone": ""
 *     },
 *     "shipping": {
 *       "first_name": "Jennifer",
 *       "last_name": "Campbell",
 *       "company": "Quartierdepot",
 *       "address_1": "R\u00f6telstrasse 126",
 *       "address_2": "",
 *       "city": "Z\u00fcrich",
 *       "state": "",
 *       "postcode": "8057",
 *       "country": "",
 *       "phone": ""
 *     },
 *     "payment_method": "",
 *     "payment_method_title": "",
 *     "transaction_id": "",
 *     "customer_ip_address": "",
 *     "customer_user_agent": "",
 *     "created_via": "rest-api",
 *     "customer_note": "",
 *     "date_completed": "2025-12-10T20:39:05",
 *     "date_paid": "2025-12-10T20:38:05",
 *     "cart_hash": "",
 *     "number": "30272",
 *     "meta_data": [
 *       { "id": 1051535, "key": "bankabgleichskontrolle", "value": "0" },
 *       {
 *         "id": 1051536,
 *         "key": "_bankabgleichskontrolle",
 *         "value": "field_60dce78647468"
 *       },
 *       { "id": 1051537, "key": "in_buchhaltung_ubertragen", "value": "0" },
 *       {
 *         "id": 1051538,
 *         "key": "_in_buchhaltung_ubertragen",
 *         "value": "field_60dce8e1a46f9"
 *       }
 *     ],
 *     "line_items": [
 *       {
 *         "id": 92952,
 *         "name": "Cassata Ice-Torte, Sorbetto, 350ml",
 *         "product_id": 19087,
 *         "variation_id": 0,
 *         "quantity": 1,
 *         "tax_class": "mwst-reduzierter-satz",
 *         "subtotal": "16.27",
 *         "subtotal_tax": "0.42",
 *         "total": "16.27",
 *         "total_tax": "0.42",
 *         "taxes": [{ "id": 4, "total": "0.422943", "subtotal": "0.422943" }],
 *         "meta_data": [
 *           {
 *             "id": 852171,
 *             "key": "_price_without_tax",
 *             "value": "16.267057",
 *             "display_key": "_price_without_tax",
 *             "display_value": "16.267057"
 *           },
 *           {
 *             "id": 852172,
 *             "key": "_price_with_tax",
 *             "value": "16.69",
 *             "display_key": "_price_with_tax",
 *             "display_value": "16.69"
 *           }
 *         ],
 *         "sku": "QD-0-0015",
 *         "price": 16.267057000000001,
 *         "image": { "id": "", "src": "" },
 *         "parent_name": null
 *       }
 *     ],
 *     "tax_lines": [
 *       {
 *         "id": 92953,
 *         "rate_code": "CH-ZH-MWST. REDUZIERTER SATZ-1",
 *         "rate_id": 4,
 *         "label": "MwSt. reduzierter Satz",
 *         "compound": false,
 *         "tax_total": "0.42",
 *         "shipping_tax_total": "0.00",
 *         "rate_percent": 2.6000000000000001,
 *         "meta_data": []
 *       }
 *     ],
 *     "shipping_lines": [],
 *     "fee_lines": [],
 *     "coupon_lines": [],
 *     "refunds": [],
 *     "payment_url": "https://quartierdepot-april2024.local/kasse/bezahlen/30272/?pay_for_order=true&key=wc_order_MhNrgvSaYl40p",
 *     "is_editable": false,
 *     "needs_payment": false,
 *     "needs_processing": true,
 *     "date_created_gmt": "2025-12-10T19:38:05",
 *     "date_modified_gmt": "2025-12-10T19:39:05",
 *     "date_completed_gmt": "2025-12-10T19:39:05",
 *     "date_paid_gmt": "2025-12-10T19:38:05",
 *     "currency_symbol": "CHF",
 *     "_links": {
 *       "self": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders/30272"
 *         }
 *       ],
 *       "collection": [
 *         { "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/orders" }
 *       ],
 *       "customer": [
 *         {
 *           "href": "https://quartierdepot-april2024.local/wp-json/wc/v3/customers/213"
 *         }
 *       ]
 *     }
 *   }
 * ]
 */