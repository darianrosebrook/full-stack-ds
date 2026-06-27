import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Public package style export only — no reach into dist/ internals.
import "@full-stack-ds/react/styles.css";
// App-shell layout CSS (page frame only — see app-shell.css header for the
// strict boundary it must not cross).
import "./app-shell.css";
import { App } from "./App";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
