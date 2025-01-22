import './App.css'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {Main} from "./screens/main/Main.tsx";

const queryClient = new QueryClient();

function App() {

    return (
        <QueryClientProvider client={queryClient}>
            <Main/>
        </QueryClientProvider>
    )
}

export default App
