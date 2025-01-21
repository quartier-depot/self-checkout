import {useQuery} from "@tanstack/react-query";
import {getProducts} from "../api/getProducts.ts";

export function Products() {

    const {isPending, error, data} = useQuery({
        queryKey: ['products'],
        queryFn: getProducts
    });

    if (isPending) return 'Loading...'

    if (error) return 'An error has occurred: ' + error.message

    return (
        <h1 className="text-3xl font-bold underline">
            {data?.length}
        </h1>
    )
}

