
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { initializeOfflineSync } from "./lib/offlineSync";
import "./index.css";
import "./mobile-dashboard.css";

// Initialize offline sync manager
console.log('🚀 AidLink Kakuma - Initializing...');
initializeOfflineSync();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
