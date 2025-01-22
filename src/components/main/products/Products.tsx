import {EmptySearch} from "./EmptySearch.tsx";
import {useAppContext} from "../../../context/useAppContext.ts";
import {NoProducts} from "./NoProducts.tsx";
import {Product} from "./Product.tsx";

export function Products() {
    const {state} = useAppContext();

    return (
        <>
            <div className={'h-full overflow-hidden mt-4'}>
                <div className={'h-full overflow-y-auto px-2'}>
                    { state.products === undefined && (
                        <NoProducts />
                    )}
                    {state.products && state.products.length === 0 && (
                        <EmptySearch/>
                    )}
                    {state.products && state.products.length > 0 && (
                        <div className={'grid grid-cols-4 gap-4 pb-3'}>
                            {state.products!.map((product) => <Product key={product.id} product={product}/>)}
                        </div>
                    )}
                </div>
            </div>
        </>
    )

}
