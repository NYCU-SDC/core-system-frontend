import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {BrowserRouter} from "react-router-dom";
import {store} from './app/store'
import {Provider} from 'react-redux'
import {Toaster} from "sonner";

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <StrictMode>
            <BrowserRouter>
                <App/>
                <Toaster expand={true}/>
            </BrowserRouter>
        </StrictMode>,
    </Provider>
);
