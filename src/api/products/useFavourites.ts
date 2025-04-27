import { useQuery } from '@tanstack/react-query';
import { Product } from './Product';
import { useApi, WooCommerceRestApi } from '../useApi';

const MAX_FAVOURITES = 14;

export function useFavourites(customerId: number | undefined, products: Product[]) {
    const api = useApi();
    const customerIdString = customerId ? customerId.toString() : 'undefined';
    return useQuery({
        queryKey: ['favourites', customerIdString],
        queryFn: async () => getFavourites(api, customerIdString, products),
        enabled: customerId !== undefined
    });
}

async function getFavourites(api: WooCommerceRestApi, customerId: string, products: Product[]): Promise<Product[]> {
    if (customerId === 'undefined') {
        return [];
    }

    if (!products) {
        return [];
    }

    const response = await api.get('orders', {
        customer: customerId,
        per_page: 25,
        status: 'completed'
    });

    if (!response.data) {
        return [];
    }

    const productCounts = new Map<number, number>();
    response.data.forEach((order: any) => {
        order.line_items?.forEach((item: any) => {
            productCounts.set(item.product_id, (productCounts.get(item.product_id) || 0) + 1);
        });
    });

    const favourites = Array.from(productCounts).map(([id, count]) => {
            return {
                id,
                count,
                product: products.find(product => product.id === id)
            }
        })
        .filter(f => f.product)
        .sort((a, b) => b.count - a.count)
        .slice(0, MAX_FAVOURITES);

    return favourites.map(favourite => favourite.product!);
} 