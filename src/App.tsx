import './App.css'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Main} from "./screens/main/Main.tsx";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function App() {

    return (
        <QueryClientProvider client={queryClient}>
            <Main/>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

export default App
