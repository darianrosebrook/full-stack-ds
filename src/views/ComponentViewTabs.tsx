import { Links } from "@full-stack-ds/react";
import { buildHref, type ComponentTab } from "../router";

interface ComponentViewTabsProps {
  componentName: string;
  activeTab: ComponentTab;
}

const TABS: { tab: ComponentTab; label: string }[] = [
  { tab: "design", label: "Design" },
  { tab: "developer", label: "Developer" },
  { tab: "tokens", label: "Tokens" },
];

export function ComponentViewTabs({ componentName, activeTab }: ComponentViewTabsProps) {
  return (
    <nav className="view-tabs" aria-label="View mode">
      {TABS.map(({ tab, label }) => (
        <Links
          key={tab}
          className={`view-tab${activeTab === tab ? " view-tab--active" : ""}`}
          href={buildHref({ kind: "component", name: componentName, tab })}
          aria-current={activeTab === tab ? "page" : undefined}
        >
          {label}
        </Links>
      ))}
    </nav>
  );
}
