import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/joy/styles";
import AuthPage from "./pages/Login/AuthPage";
import HomePage from "./pages/Homepage/Homepage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />  {/* Route to HomePage */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} /> { /* Route to login */}
        </Routes>
      </Router>
    </StyledEngineProvider>
  );
};

ReactDOM.createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);