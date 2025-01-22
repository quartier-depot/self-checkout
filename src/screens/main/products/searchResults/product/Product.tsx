import {Product as ProductClass} from "../../../../../api/products/Product";

interface ProductProps {
    product: ProductClass
}

export function Product({product}: ProductProps) {
    return (
        <div role="button" className={'select-none cursor-pointer transition-shadow overflow-hidden rounded-2xl bg-white shadow hover:shadow-lg p-8 text-center'}>
            <h2 className={'text-4xl'}>
                {product.artikel_id}
            </h2>
                <p className={'flex-grow truncate mr-1'}>{product.name}</p>
                <p className={'nowrap font-semibold'}>{product.price}</p>
        </div>
    )
}