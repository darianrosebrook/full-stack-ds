import { useMemo, useState } from "react";
import { NavList, NavListItem, NavTree, NavTreeItem, Input, Badge } from "@full-stack-ds/react";
import type { Bundle, ComponentBundle } from "../types/data";
import { buildHref, type Route } from "../router";

const LAYER_ORDER = ["primitive", "compound", "composer", "assembly"] as const;
const LAYER_LABEL: Record<(typeof LAYER_ORDER)[number], string> = {
  primitive: "Primitives",
  compound: "Compounds",
  composer: "Composers",
  assembly: "Assemblies",
};

interface SidebarProps {
  bundle: Bundle;
  route: Route;
}

export function Sidebar({ bundle, route }: SidebarProps) {
  const [filter, setFilter] = useState("");

  const grouped = useMemo(() => {
    const groups = new Map<string, ComponentBundle[]>();
    const needle = filter.trim().toLowerCase();
    for (const c of bundle.components) {
      const layer = c.contract.layer ?? "compound";
      if (needle && !c.name.toLowerCase().includes(needle)) continue;
      if (!groups.has(layer)) groups.set(layer, []);
      groups.get(layer)!.push(c);
    }
    return groups;
  }, [bundle.components, filter]);

  const activeComponent = route.kind === "component" ? route.name : null;
  const activePrimitive = route.kind === "primitive" ? route.name : null;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-search">
        <Input
          type="search"
          placeholder="Filter components…"
          aria-label="Filter components"
          value={filter}
          onChange={setFilter}
        />
      </div>
      <NavList ariaLabel="Showcase sections" className="sidebar-navlist">
        <NavListItem className="sidebar-item-host">
          <a
            className={`sidebar-item${route.kind === "home" ? " sidebar-item--active" : ""}`}
            href={buildHref({ kind: "home" })}
            aria-current={route.kind === "home" ? "page" : undefined}
          >
            <span>Overview</span>
          </a>
        </NavListItem>
        <NavListItem className="sidebar-item-host">
          <a
            className={`sidebar-item${route.kind === "architecture" ? " sidebar-item--active" : ""}`}
            href={buildHref({ kind: "architecture" })}
            aria-current={route.kind === "architecture" ? "page" : undefined}
          >
            <span>Architecture</span>
          </a>
        </NavListItem>
        <NavListItem className="sidebar-item-host">
          <a
            className={`sidebar-item${route.kind === "tokens" ? " sidebar-item--active" : ""}`}
            href={buildHref({ kind: "tokens" })}
            aria-current={route.kind === "tokens" ? "page" : undefined}
          >
            <span>Tokens</span>
            <Badge variant="counter" size="sm">
              {bundle.foundationTokens.length}
            </Badge>
          </a>
        </NavListItem>

        <NavTree label="Standards" icon="check">
          <NavTreeItem>
            <a
              href={buildHref({ kind: "tokens-philosophy", tab: "overview" })}
              aria-current={route.kind === "tokens-philosophy" ? "page" : undefined}
            >
              <span>Tokens philosophy</span>
            </a>
          </NavTreeItem>
          <NavTreeItem>
            <a
              href={buildHref({ kind: "complexity", tab: "overview" })}
              aria-current={route.kind === "complexity" ? "page" : undefined}
            >
              <span>Component complexity</span>
            </a>
          </NavTreeItem>
          <NavTreeItem>
            <a
              href={buildHref({ kind: "standards", tab: "overview" })}
              aria-current={route.kind === "standards" ? "page" : undefined}
            >
              <span>Component standards</span>
            </a>
          </NavTreeItem>
        </NavTree>

        {bundle.primitives.length > 0 && (
          <NavTree label="Foundations" icon="baseline">
            {bundle.primitives.map((p) => (
              <NavTreeItem key={p.name}>
                <a
                  href={buildHref({ kind: "primitive", name: p.name })}
                  aria-current={activePrimitive === p.name ? "page" : undefined}
                >
                  <span>{p.name}</span>
                  <Badge variant="tag" size="sm">
                    primitive
                  </Badge>
                </a>
              </NavTreeItem>
            ))}
          </NavTree>
        )}

        {LAYER_ORDER.map((layer) => {
          const items = grouped.get(layer);
          if (!items || items.length === 0) return null;
          return (
            <NavTree key={layer} label={LAYER_LABEL[layer]}>
              {items.map((c) => (
                <NavTreeItem key={c.name}>
                  <a
                    href={buildHref({ kind: "component", name: c.name, tab: "design" })}
                    aria-current={activeComponent === c.name ? "page" : undefined}
                  >
                    <span>{c.name}</span>
                    <Badge variant="counter" size="sm">
                      {Object.keys(c.sources).length}/5
                    </Badge>
                  </a>
                </NavTreeItem>
              ))}
            </NavTree>
          );
        })}
      </NavList>
    </aside>
  );
}
