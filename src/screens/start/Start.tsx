import { useProducts} from "../../api/getProducts.ts";

export function Start() {

    const {isPending, error, data} = useProducts();

    if (isPending) return 'Loading...'

    if (error) return 'An error has occurred: ' + error.message

    return (
        <h1 className="text-3xl font-bold underline">
            {data?.length}
        </h1>
    )
}

