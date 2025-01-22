import {ProductsMainParams} from "woocommerce-rest-ts-api";

interface ProductProps {
    product: ProductsMainParams
}

export function Product({product}: ProductProps) {
    return (
        <div role="button" className={'select-none cursor-pointer transition-shadow overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg p-8 text-center'}>
            <h2 className={'text-4xl'}>
                {product['meta_data'][0].value}
            </h2>
                <p className={'flex-grow truncate mr-1'}>{product['name']}</p>
                <p className={'nowrap font-semibold'}>{product['price']}</p>
        </div>
    )
}