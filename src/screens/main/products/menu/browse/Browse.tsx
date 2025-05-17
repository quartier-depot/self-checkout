import { Button } from "../../../../../components/button/Button";
import { useMemo } from "react";
import { useAppDispatch } from "../../../../../store/store";
import { setProducts } from "../../../../../store/slices/browseSlice";
import { useGetProductsQuery } from "../../../../../store/api/woocommerceApi";
import { Product } from "../../../../../api/products/Product";

type BrowseProps = {
    active: boolean;
    onClick: () => void;
}

export function Browse({ active, onClick }: BrowseProps) {
    const dispatch = useAppDispatch();
    const { data: products } = useGetProductsQuery();

    const gestelle = useMemo(() => {
        if (!products) {
            return [];
        }

        const gestelleMap = new Map<string, Product[]>();
        products.forEach(product => {
            if (product.gestell) {
                const products = gestelleMap.get(product.gestell) || [];
                products.push(product);
                gestelleMap.set(product.gestell, products);
            }
        });

        return Array.from(gestelleMap.entries()).map(([gestell, products]) => ({
            gestell,
            products
        }));
    }, [products]);

    function handleClick() {
        dispatch(setProducts(gestelle));
        onClick();
    }

    return (
        <Button type="secondary" onClick={handleClick} toggled={active}>
            Gestelle
        </Button>
    );
}