import './App.css'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Start} from "./screens/start/Start.tsx";

const queryClient = new QueryClient();

function App() {

    return (
        <QueryClientProvider client={queryClient}>
            <Start/>
        </QueryClientProvider>
    )
}

export default App
