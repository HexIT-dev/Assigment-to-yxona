import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#fff",
              color: "#2a1a14",
              border: "1px solid #ecdcc4",
              borderRadius: "12px",
              fontWeight: 600,
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
