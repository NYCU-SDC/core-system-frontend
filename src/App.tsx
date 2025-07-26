import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
// import {Counter} from "@/features/example/Counter.tsx";
import OAuthCallback from "@/features/auth/pages/OAuthCallback.tsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    <Route path="/auth/callback" element={<OAuthCallback />} />
    </Routes>
  );
};

export default App;
