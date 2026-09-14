import { bundle } from "./types/bundle";
import { SettingsView } from "./views/SettingsView";
import { ActivityView } from "./views/ActivityView";
import { CommandPalette, useCommandPaletteHotkey } from "./components/CommandPalette";
import { setPrefs, usePrefs } from "./prefs";
import { useEffect, useMemo, useState } from "react";
import { Header } from "./layout/Header";
import { Sidebar } from "./layout/Sidebar";
import { TracePanel } from "./layout/TracePanel";
import { Home } from "./views/Home";
import { ArchitectureView } from "./views/ArchitectureView";
import { DesignView } from "./views/DesignView";
import { DeveloperView } from "./views/DeveloperView";
import { ComponentTokensView } from "./views/ComponentTokensView";
import { TokensView } from "./views/TokensView";
import { TokensPhilosophyView } from "./views/TokensPhilosophyView";
import { ComponentComplexityView } from "./views/ComponentComplexityView";
import { ComponentStandardsView } from "./views/ComponentStandardsView";
import { DisplayCaseView } from "./views/DisplayCaseView";
import { PrimitiveView } from "./views/PrimitiveView";
import { PropertiesScratchView } from "./views/PropertiesScratchView";
import { AnalyticalFixturesScratchView } from "./views/AnalyticalFixturesScratchView";
import { DocsView } from "./views/DocsView";
import { useRoute } from "./router";
import type { TraceSelection } from "./trace/types";

// Stable empty references so a component with no overrides doesn't get a fresh
// object each render (which would churn memoized preview/panel consumers).
const EMPTY_PROPS: Record<string, unknown> = {};
const EMPTY_TOKENS: Record<string, string> = {};

export function App() {
  const [route] = useRoute();
  const [trace, setTrace] = useState<TraceSelection | null>(null);

  // Per-component live-edit overrides from the Properties tab, keyed by
  // component name so switching components preserves each one's edits for the
  // session. propOverrides drive prop controls; tokenOverrides drive the
  // box-model/fill/etc. token edits and re-skin DesignView's live previews.
  const [propOverrides, setPropOverrides] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [tokenOverrides, setTokenOverrides] = useState<
    Record<string, Record<string, string>>
  >({});

  const activeComponent = useMemo(() => {
    if (route.kind !== "component") return null;
    const name = route.name;
    return bundle.components.find((c) => c.name === name) ?? null;
  }, [route]);

  const activeName = activeComponent?.name ?? "";
  const activeProps = propOverrides[activeName] ?? EMPTY_PROPS;
  const activeTokens = tokenOverrides[activeName] ?? EMPTY_TOKENS;

  const onPropChange = (name: string, value: unknown) =>
    setPropOverrides((prev) => ({
      ...prev,
      [activeName]: { ...(prev[activeName] ?? {}), [name]: value },
    }));
  const onTokenChange = (slot: string, value: string) =>
    setTokenOverrides((prev) => ({
      ...prev,
      [activeName]: { ...(prev[activeName] ?? {}), [slot]: value },
    }));
  const onResetOverrides = () => {
    setPropOverrides((prev) => {
      const { [activeName]: _, ...rest } = prev;
      return rest;
    });
    setTokenOverrides((prev) => {
      const { [activeName]: _, ...rest } = prev;
      return rest;
    });
  };

  const activePrimitive = useMemo(() => {
    if (route.kind !== "primitive") return null;
    const name = route.name;
    return bundle.primitives.find((p) => p.name === name) ?? null;
  }, [route]);

  const prefs = usePrefs();
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 900px)").matches);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const showTrace = route.kind === "component" && (compact ? mobileInspectorOpen : prefs.tracePanelVisible);
  const [paletteOpen, setPaletteOpen] = useState(false);
  useCommandPaletteHotkey(() => setPaletteOpen(true));

  const toggleSidebar = () => setPrefs({ sidebarVisible: !prefs.sidebarVisible });
  const toggleInspector = () => compact ? setMobileInspectorOpen(!mobileInspectorOpen) : setPrefs({ tracePanelVisible: !prefs.tracePanelVisible });
  const togglePanels = () => {
    const visible = !(prefs.sidebarVisible || showTrace);
    if (!visible && document.activeElement?.closest(".app-sidebar, .app-trace")) {
      document.getElementById("showcase-toggle-navigation")?.focus();
    }
    setPrefs({ sidebarVisible: visible, tracePanelVisible: visible });
    setMobileInspectorOpen(visible);
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "\\" && !event.altKey && !event.shiftKey && !event.repeat) {
        event.preventDefault();
        togglePanels();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className={`app-shell${showTrace ? "" : " app-shell--no-trace"}${prefs.sidebarVisible ? "" : " app-shell--no-sidebar"}`}>
      <Header onOpenPalette={() => setPaletteOpen(true)}
        sidebarVisible={prefs.sidebarVisible} onToggleSidebar={toggleSidebar}
        inspectorVisible={showTrace} onToggleInspector={route.kind === "component" ? toggleInspector : undefined} />
      {prefs.sidebarVisible && <Sidebar bundle={bundle} route={route} />}

      <main className="app-main">
        {route.kind === "home" && <Home bundle={bundle} />}
        {route.kind === "architecture" && <ArchitectureView bundle={bundle} />}
        {route.kind === "tokens" && <TokensView bundle={bundle} />}
        {route.kind === "settings" && <SettingsView />}
        {route.kind === "activity" && <ActivityView bundle={bundle} />}
        {route.kind === "display-case" && <DisplayCaseView bundle={bundle} />}
        {route.kind === "docs" && (
          <DocsView path={route.path} fragment={route.fragment ?? null} />
        )}
        {route.kind === "tokens-philosophy" && (
          <TokensPhilosophyView tab={route.tab} />
        )}
        {route.kind === "complexity" && (
          <ComponentComplexityView tab={route.tab} />
        )}
        {route.kind === "standards" && (
          <ComponentStandardsView tab={route.tab} />
        )}
        {route.kind === "scratch" && route.name === "properties-panel" && (
          <PropertiesScratchView />
        )}
        {route.kind === "scratch" && route.name === "analytical-fixtures" && (
          <AnalyticalFixturesScratchView />
        )}
        {route.kind === "primitive" && activePrimitive && (
          <PrimitiveView primitive={activePrimitive} />
        )}
        {route.kind === "primitive" && !activePrimitive && (
          <div className="page">
            <h1 className="page-title">Primitive not found</h1>
          </div>
        )}
        {route.kind === "component" && activeComponent && (
          route.tab === "design" ? (
            <DesignView
              component={activeComponent}
              propOverrides={activeProps}
              tokenOverrides={activeTokens}
            />
          ) : route.tab === "developer" ? (
            <DeveloperView
              component={activeComponent}
              trace={trace}
              onTrace={setTrace}
              propOverrides={activeProps}
              tokenOverrides={activeTokens}
            />
          ) : (
            <ComponentTokensView component={activeComponent} />
          )
        )}
        {route.kind === "component" && !activeComponent && (
          <div className="page">
            <h1 className="page-title">Component not found</h1>
            <p className="page-lede">No contract matches “{route.name}”.</p>
          </div>
        )}
      </main>

      {showTrace && (
        <aside id="showcase-inspector" className="app-trace" aria-label="Component inspector">
          <TracePanel
            component={activeComponent}
            selection={trace}
            onClear={() => setTrace(null)}
            propValues={activeProps}
            onPropChange={onPropChange}
            tokenValues={activeTokens}
            onTokenChange={onTokenChange}
            onResetOverrides={onResetOverrides}
            foundationTokens={bundle.foundationTokens}
          />
        </aside>
      )}
          <CommandPalette bundle={bundle} open={paletteOpen} onOpenChange={setPaletteOpen} actions={[
        { id: "sidebar", label: prefs.sidebarVisible ? "Hide navigation" : "Show navigation", hint: "Left panel", run: toggleSidebar },
        ...(route.kind === "component" ? [{ id: "inspector", label: showTrace ? "Hide inspector" : "Show inspector", hint: "Right panel", run: toggleInspector }] : []),
        { id: "panels", label: prefs.sidebarVisible || showTrace ? "Hide panels" : "Show panels", hint: "⌘ / Ctrl + \\", run: togglePanels },
      ]} />
    </div>
  );
}
