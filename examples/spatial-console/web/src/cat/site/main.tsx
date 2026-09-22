import { createRoot } from "react-dom/client";
import "@full-stack-ds/tokens/tokens.css";
import "@full-stack-ds/react/styles.css";
import "./site.css";
import { resolveSiteStore } from "../site-store";
import { Site } from "./Site";

createRoot(document.getElementById("root") as HTMLElement).render(<Site store={resolveSiteStore()} />);
