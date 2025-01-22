import './App.css'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {Start} from "./components/start/Start.tsx";
import {useAppContext} from "./context/useAppContext.ts";
import {Main} from "./components/main/Main.tsx";

const queryClient = new QueryClient();

function App() {
    const {state} = useAppContext();

    return (
        <QueryClientProvider client={queryClient}>
            {state.initialized ? <Main /> : <Start/>}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

export default App
