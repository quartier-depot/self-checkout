import WooCommerceRestApi, {ProductsMainParams, WooRestApiOptions} from "woocommerce-rest-ts-api";
import {getConfiguration} from "../configuration/getConfiguration.ts";
import {useQuery} from "@tanstack/react-query";

type WooCommerceRestApiResponse<T> = {
    data: T[]
}

export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: getProducts
    });
}

async function getProducts(): Promise<ProductsMainParams[]> {
    const maximumItemsPerPage = 100;
    const configuration = getConfiguration();

    const options: WooRestApiOptions = {
        url: configuration.woocommerce.url,
        consumerKey: configuration.woocommerce.consumerKey,
        consumerSecret: configuration.woocommerce.consumerSecret,
        version: "wc/v3",
        queryStringAuth: false,
        axiosConfig: {
            insecureHTTPParser: true,
        }
    }

    const api = new WooCommerceRestApi(options);
    const initial = await api.get("products");
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

    let products: ProductsMainParams[] = [];
    const responses = await Promise.all(promises);
    for (const response of responses) {
        products = products.concat(response.data);
    }

    return products
}