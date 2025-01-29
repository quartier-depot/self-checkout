import {ProductsMainParams} from "woocommerce-rest-ts-api";
import {useQuery} from "@tanstack/react-query";
import {Product} from "./Product.ts";
import {WooCommerceRestApiResponse} from "../WooCommerceRestApiResponse.ts";
import {getApi} from "../getApi.ts";


export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: getProducts
    });
}

async function getProducts(): Promise<Product[]> {
    const maximumItemsPerPage = 100;
    const api = getApi();

    const initial = await api.get("products", {
        status: "publish"
    });
    const total = initial.headers['x-wp-total'];

    if (initial.data.length === total) {
        return initial.data;
    }

    const numberOfRequests = 1; // Math.ceil(total / maximumItemsPerPage);
    const promises: Promise<WooCommerceRestApiResponse<ProductsMainParams>>[] = [];
    for (let i = 0; i < numberOfRequests; i++) {
        promises.push(api.get("products", {
            per_page: maximumItemsPerPage,
            page: i + 1
        }));
    }

    let products: any[] = [];
    const responses = await Promise.all(promises);
    for (const response of responses) {
        products = products.concat(response.data);
    }

    return products.map(product => new Product(product));
}