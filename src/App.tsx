import './App.css'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Products} from "./screens/Products.tsx";

const queryClient = new QueryClient();

function App() {

    return (
        <QueryClientProvider client={queryClient}>
            <Products/>
        </QueryClientProvider>
    )
}

export default App
