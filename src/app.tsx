import { bundle } from "./types/bundle";
import { useMemo, useState } from "react";
import { Header } from "./layout/Header";
import { Sidebar } from "./layout/Sidebar";
import { TracePanel } from "./layout/TracePanel";
import { Home } from "./views/Home";
import { ArchitectureView } from "./views/ArchitectureView";
import { DesignView } from "./views/DesignView";
import { DeveloperView } from "./views/DeveloperView";
import { TokensView } from "./views/TokensView";
import { TokensPhilosophyView } from "./views/TokensPhilosophyView";
import { ComponentComplexityView } from "./views/ComponentComplexityView";
import { PrimitiveView } from "./views/PrimitiveView";
import { useRoute } from "./router";
import type { TraceSelection } from "./trace/types";

export function App() {
  const [route] = useRoute();
  const [trace, setTrace] = useState<TraceSelection | null>(null);

  const activeComponent = useMemo(() => {
    if (route.kind !== "component") return null;
    const name = route.name;
    return bundle.components.find((c) => c.name === name) ?? null;
  }, [route]);

  const activePrimitive = useMemo(() => {
    if (route.kind !== "primitive") return null;
    const name = route.name;
    return bundle.primitives.find((p) => p.name === name) ?? null;
  }, [route]);

  const showTrace = route.kind === "component";

  return (
    <div className={`app-shell${showTrace ? "" : " app-shell--no-trace"}`}>
      <Header />
      <Sidebar bundle={bundle} route={route} />

      <main className="app-main">
        {route.kind === "home" && <Home bundle={bundle} />}
        {route.kind === "architecture" && <ArchitectureView bundle={bundle} />}
        {route.kind === "tokens" && <TokensView bundle={bundle} />}
        {route.kind === "tokens-philosophy" && (
          <TokensPhilosophyView tab={route.tab} />
        )}
        {route.kind === "complexity" && (
          <ComponentComplexityView tab={route.tab} />
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
            <DesignView component={activeComponent} route={route} />
          ) : (
            <DeveloperView
              component={activeComponent}
              route={route}
              trace={trace}
              onTrace={setTrace}
            />
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
        <aside className="app-trace">
          <TracePanel
            component={activeComponent}
            selection={trace}
            onClear={() => setTrace(null)}
          />
        </aside>
      )}
    </div>
  );
}
