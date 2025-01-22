import { useProducts} from "../../api/products/useProducts.ts";

export function Start() {

    const productsQuery = useProducts();

    // noinspection HtmlUnknownTarget
    return (
        <div className={'bg-emerald-950 w-screen h-screen flex flex-col place-items-center'} >
            <img src="./logo-weiss.svg" alt="logo" className={'my-10'} width="500px"/>
            <img src="./angebots-illustration-green-p-1080.png" alt="illustration" className={'my-10'} width={'710px'}/>
            <ul className={'text-emerald-50'}>
                <li>
                    {productsQuery.data && `${productsQuery.data.length} Produkte geladen`}
                    {(productsQuery.isLoading || productsQuery.isFetching) && `Produkte laden`}
                    {productsQuery.error  && `Fehler beim Laden der Produkte`}
                </li>
            </ul>
        </div>
    )
}

