import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import DefaultLayout from "./pages/layouts/DefaultLayout";

const App = () => {
    return (
        <Routes>
            <Route element={<DefaultLayout />}>
                <Route path="/" element={<Home />} />
            </Route>
        </Routes>
    );
};

export default App;
