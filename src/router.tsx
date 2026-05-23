import { useEffect, useState, useCallback } from "react";

export type TokensTab =
  | "overview"
  | "core-vs-semantic"
  | "box-model-primitive"
  | "variant-redirection"
  | "token-naming"
  | "theming"
  | "dtcg-formats"
  | "resolver-module"
  | "schema-validation"
  | "build-outputs"
  | "accessibility";

export type ComplexityTab =
  | "overview"
  | "primitives"
  | "compounds"
  | "composers"
  | "assemblies";

export type StandardsTab =
  | "overview"
  | "anatomy"
  | "props"
  | "states"
  | "usage"
  | "accessibility";

export type Route =
  | { kind: "home" }
  | { kind: "architecture" }
  | { kind: "component"; name: string; tab: "design" | "developer" }
  | { kind: "tokens" }
  | { kind: "primitive"; name: string }
  | { kind: "tokens-philosophy"; tab: TokensTab }
  | { kind: "complexity"; tab: ComplexityTab }
  | { kind: "standards"; tab: StandardsTab };

const TOKENS_TABS = new Set<TokensTab>([
  "overview",
  "core-vs-semantic",
  "box-model-primitive",
  "variant-redirection",
  "token-naming",
  "theming",
  "dtcg-formats",
  "resolver-module",
  "schema-validation",
  "build-outputs",
  "accessibility",
]);

const COMPLEXITY_TABS = new Set<ComplexityTab>([
  "overview",
  "primitives",
  "compounds",
  "composers",
  "assemblies",
]);

const STANDARDS_TABS = new Set<StandardsTab>([
  "overview",
  "anatomy",
  "props",
  "states",
  "usage",
  "accessibility",
]);

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
  if (parts[0] === "tokens-philosophy") {
    const tab = (parts[1] ?? "overview") as TokensTab;
    return {
      kind: "tokens-philosophy",
      tab: TOKENS_TABS.has(tab) ? tab : "overview",
    };
  }
  if (parts[0] === "complexity") {
    const tab = (parts[1] ?? "overview") as ComplexityTab;
    return {
      kind: "complexity",
      tab: COMPLEXITY_TABS.has(tab) ? tab : "overview",
    };
  }
  if (parts[0] === "standards") {
    const tab = (parts[1] ?? "overview") as StandardsTab;
    return {
      kind: "standards",
      tab: STANDARDS_TABS.has(tab) ? tab : "overview",
    };
  }
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
    case "tokens-philosophy":
      return route.tab === "overview"
        ? "#/tokens-philosophy"
        : `#/tokens-philosophy/${route.tab}`;
    case "complexity":
      return route.tab === "overview"
        ? "#/complexity"
        : `#/complexity/${route.tab}`;
    case "standards":
      return route.tab === "overview"
        ? "#/standards"
        : `#/standards/${route.tab}`;
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
