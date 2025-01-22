import {EmptySearch} from "./EmptySearch.tsx";
import {ProductsMainParams} from "woocommerce-rest-ts-api";
import {Product} from "./product/Product.tsx";

interface SearchResultsProps {
    products: ProductsMainParams[]
}

export function SearchResults({products}: SearchResultsProps) {
    return (
        <>
            <div className={'h-full overflow-hidden mt-4'}>
                <div className={'h-full overflow-y-auto px-2'}>
                    {products.length === 0 && (
                        <EmptySearch/>
                    )}
                    {products.length > 0 && (
                        <div className={'grid grid-cols-4 gap-4 pb-3'}>
                            {products.map((product) => <Product key={product.id} product={product}/>)}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}