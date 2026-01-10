import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";


const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento #root não encontrado no HTML");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
