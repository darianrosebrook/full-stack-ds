import { useEffect, useState, useCallback } from "react";

export type Route =
  | { kind: "home" }
  | { kind: "architecture" }
  | { kind: "component"; name: string; tab: "design" | "developer" }
  | { kind: "tokens" }
  | { kind: "primitive"; name: string };

function parseHash(hash: string): Route {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const cleaned = raw.startsWith("/") ? raw.slice(1) : raw;
  if (!cleaned) return { kind: "home" };
  const parts = cleaned.split("/").filter(Boolean);
  if (parts[0] === "component" && parts[1]) {
    const tab = parts[2] === "developer" ? "developer" : "design";
    return { kind: "component", name: parts[1], tab };
  }
  if (parts[0] === "primitive" && parts[1]) {
    return { kind: "primitive", name: parts[1] };
  }
  if (parts[0] === "tokens") return { kind: "tokens" };
  if (parts[0] === "architecture") return { kind: "architecture" };
  return { kind: "home" };
}

function buildHref(route: Route): string {
  switch (route.kind) {
    case "home":
      return "#/";
    case "architecture":
      return "#/architecture";
    case "component":
      return `#/component/${route.name}/${route.tab}`;
    case "primitive":
      return `#/primitive/${route.name}`;
    case "tokens":
      return "#/tokens";
  }
}

export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((next: Route) => {
    const href = buildHref(next);
    if (href !== window.location.hash) {
      window.location.hash = href;
    } else {
      setRoute(next);
    }
  }, []);

  return [route, navigate];
}

export { buildHref };
