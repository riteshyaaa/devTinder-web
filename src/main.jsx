import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply saved theme on initial load
const savedTheme = localStorage.getItem("devtinder-theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
