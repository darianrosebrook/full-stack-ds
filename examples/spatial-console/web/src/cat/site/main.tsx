import { createRoot } from "react-dom/client";
import "@full-stack-ds/tokens/tokens.css";
import "@full-stack-ds/react/styles.css";
import "./site.css";
import { resolveSiteStore } from "../site-store";
import { Site } from "./Site";

// The desk loads each frame with ?device=laptop|tablet|phone; handheld
// devices get an on-screen keyboard.
const device = new URLSearchParams(location.search).get("device") ?? "laptop";
document.documentElement.dataset.device = device;

createRoot(document.getElementById("root") as HTMLElement).render(
  <Site store={resolveSiteStore()} onScreenKeyboard={device === "tablet" || device === "phone"} />,
);
