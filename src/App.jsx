import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Screen from "./Screen.jsx";
import Login from "./pages/Login.jsx";
import Pricing from "./pages/Pricing.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { StockProvider } from "./contexts/StockContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StockProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Screen />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pricing" element={<Pricing />} />
            </Routes>
          </Router>
        </StockProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
