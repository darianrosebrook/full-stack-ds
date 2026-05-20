import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@full-stack-ds/react/styles.css";
import { App } from "./App";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
