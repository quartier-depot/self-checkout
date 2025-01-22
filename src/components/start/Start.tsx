import { useProducts} from "../../api/products/useProducts.ts";
import {useAppContext} from "../../context/useAppContext.ts";
import {useEffect} from "react";
import {ActionTypes} from "../../actions/actions.ts";
import {useCustomers} from "../../api/customers/useCustomers.ts";

export function Start() {
    const {dispatch} = useAppContext();
    const productsQuery = useProducts();
    const customersQuery = useCustomers();

    useEffect(() => {
        if (productsQuery.isSuccess && customersQuery.isSuccess) {
            dispatch({type: ActionTypes.IS_INITIALIZED});
        }
    }, [productsQuery, customersQuery]);

    // noinspection HtmlUnknownTarget
    return (
        <div className={'bg-emerald-950 w-screen h-screen flex flex-col place-items-center'} >
            <img src="./logo-weiss.svg" alt="logo" className={'my-10'} width="500px"/>
            <img src="./angebots-illustration-green-p-1080.png" alt="illustration" className={'my-10'} width={'710px'}/>
            <ul className={'text-emerald-50'}>
                <li>
                    {productsQuery.data && `${productsQuery.data.length} Produkte geladen`}
                    {(productsQuery.isLoading || productsQuery.isFetching) && `Produkte laden`}
                    {productsQuery.error && `Fehler beim Laden der Produkte`}
                </li>
                <li>
                    {customersQuery.data && `${customersQuery.data.length} Kunden geladen`}
                    {(customersQuery.isLoading || customersQuery.isFetching) && `Kunden laden`}
                    {customersQuery.error && `Fehler beim Laden der Kunden`}
                </li>
            </ul>
        </div>
    )
}

