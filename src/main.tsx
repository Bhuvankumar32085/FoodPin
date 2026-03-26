import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="301667277520-ao0vg4g1k4ikq3n8542jea4rgpu02dfb.apps.googleusercontent.com">
    <AppProvider>
        <App />
    </AppProvider>
  </GoogleOAuthProvider>,
);
