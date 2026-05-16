import { Fragment, useMemo, useState } from "react";
import type { Bundle, ComponentBundle } from "../types/data";
import { buildHref, type Route } from "../router";

const LAYER_ORDER = ["primitive", "styled", "composite"] as const;
const LAYER_LABEL: Record<(typeof LAYER_ORDER)[number], string> = {
  primitive: "Primitives",
  styled: "Styled",
  composite: "Composites",
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
      const layer = c.contract.layer ?? "styled";
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
        <input
          type="search"
          placeholder="Filter components…"
          aria-label="Filter components"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <ul className="sidebar-list">
        <li>
          <a
            className={`sidebar-item${route.kind === "home" ? " sidebar-item--active" : ""}`}
            href={buildHref({ kind: "home" })}
          >
            <span>Overview</span>
          </a>
        </li>
        <li>
          <a
            className={`sidebar-item${route.kind === "architecture" ? " sidebar-item--active" : ""}`}
            href={buildHref({ kind: "architecture" })}
          >
            <span>Architecture</span>
          </a>
        </li>
        <li>
          <a
            className={`sidebar-item${route.kind === "tokens" ? " sidebar-item--active" : ""}`}
            href={buildHref({ kind: "tokens" })}
          >
            <span>Tokens</span>
            <span className="sidebar-badge">{bundle.components.length}</span>
          </a>
        </li>

        {bundle.primitives.length > 0 && (
          <>
            <li className="sidebar-group">Foundations</li>
            {bundle.primitives.map((p) => (
              <li key={p.name}>
                <a
                  className={`sidebar-item${activePrimitive === p.name ? " sidebar-item--active" : ""}`}
                  href={buildHref({ kind: "primitive", name: p.name })}
                >
                  <span>{p.name}</span>
                  <span className="sidebar-badge">primitive</span>
                </a>
              </li>
            ))}
          </>
        )}

        {LAYER_ORDER.map((layer) => {
          const items = grouped.get(layer);
          if (!items || items.length === 0) return null;
          return (
            <Fragment key={layer}>
              <li className="sidebar-group">{LAYER_LABEL[layer]}</li>
              {items.map((c) => (
                <li key={c.name}>
                  <a
                    className={`sidebar-item${activeComponent === c.name ? " sidebar-item--active" : ""}`}
                    href={buildHref({ kind: "component", name: c.name, tab: "design" })}
                  >
                    <span>{c.name}</span>
                    <span className="sidebar-badge">
                      {Object.keys(c.sources).length}/5
                    </span>
                  </a>
                </li>
              ))}
            </Fragment>
          );
        })}
      </ul>
    </aside>
  );
}
