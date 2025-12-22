import { Page } from '@playwright/test';

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
const vegetables = [
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
]

// Customers
export const customers = [
  customer( 1, "Branson",  "Sawyer")
]


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
          ...fruits
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

  await page.route('**/wp-json/wc/v3/wallet/balance**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ balance: "42.00", currency: "CHF" }),
    });
  });

  await page.route('**/wp-json/wc/v3/ondemand/pick-up', async route => {
    const response = {
      generated: "2025-12-22",
      lists: [
        {
          id: 1,
          title: "Weekly preorder",
          description: "Description weekly",
          delivery: "2025-12-19",
          customers: [
            {
              customer_id: customers[0].id,
              preorders: [{ "product_id": fruits[0].id, "amount": 10 }]
            }
          ]
        },
        {
          id: 2,
          title: "One off preorder",
          description: "Description one off",
          delivery: "2025-12-22",
          customers: [
            {
              customer_id: customers[0].id,
              preorders: [{ "product_id": pasta[0].id, "amount": 1 }]
            }
          ]
        }
      ]
    }
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });

}

function customer(id: number, firstName: string, lastName: string) {
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
      { id: 1000+id, key: "member_id", "value": memberIdFor(id) },
      {
        id: 1100+id,
        key: "passkey_id",
        value: "passkey_id_value"
      },
      {
        id: 1200+id,
        key: "google_wallet_token",
        "value": "google_wallet_token_value"      
      },
    ],
    acf: {
      member_id: memberIdFor(id),
      passkey_id: "passkey_id_value",
      google_wallet_token: "google_wallet_token_value"
     },
  }
}

export function memberIdFor(id: number) {
  return `M${id.toString().padStart(3, '0')}4567890`
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