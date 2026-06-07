import type { JSX } from "react";
import type { AnatomyDetailed, ComponentContract, DomNode, PartDetails } from "../../types/data";

interface AnatomyProps {
  contract: ComponentContract;
}

export function Anatomy({ contract }: AnatomyProps) {
  const anatomy = contract.anatomy;
  if (!anatomy) return null;

  const detailed: AnatomyDetailed = Array.isArray(anatomy)
    ? { parts: anatomy }
    : anatomy;
  const parts = detailed.parts;
  const dom = detailed.dom;
  const details = detailed.details;

  return (
    <div className="anatomy">
      <div className="anatomy-tree">
        {dom ? renderDom(dom, 0) : (
          <ul>
            {parts.map((p) => (
              <li key={p}>
                <span className="tag">{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="anatomy-key">
        {parts.map((p) => {
          const partDetails = details?.[p];
          return (
            <div className="anatomy-key-item" key={p}>
              <div className="anatomy-key-heading">
                <code>{p}</code>
                {partDetails?.tag && <span className="pill pill--mono">&lt;{partDetails.tag}&gt;</span>}
              </div>
              <span className="muted">
                {partDetails?.description ?? semanticPartSummary(partDetails)}
              </span>
              {partDetails && <AnatomyPartMeta details={partDetails} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function semanticPartSummary(details?: PartDetails) {
  if (!details || Object.keys(details).length === 0) {
    return "Anatomy part declared by the contract.";
  }

  const fragments: string[] = [];
  if (details.role) fragments.push(`Plays the ${details.role} role`);
  if (details.interactive) fragments.push("handles user interaction");
  if (details.focusable === "roving") fragments.push("participates in roving focus");
  else if (details.focusable) fragments.push("receives focus");
  if (details.multiple) fragments.push("renders multiple instances");
  if (details.portalTarget) fragments.push("renders through a portal");
  if (details.collapsibleTo) fragments.push(`collapses to ${formatEnum(details.collapsibleTo)} where native platforms provide it`);

  if (fragments.length === 0) return "Anatomy part declared by the contract.";
  return `${fragments.join("; ")}.`;
}

function AnatomyPartMeta({ details }: { details: PartDetails }) {
  const metadata = [
    details.role && `role: ${details.role}`,
    details.interactive && "interactive",
    details.focusable && `focus: ${details.focusable === true ? "yes" : details.focusable}`,
    details.multiple && "multiple",
    details.portalTarget && "portal target",
    details.aria?.role && `aria: ${details.aria.role}`,
    details.aria?.attributes?.length && `attrs: ${details.aria.attributes.join(", ")}`,
    details.collapsibleTo && `native: ${formatEnum(details.collapsibleTo)}`,
  ].filter(Boolean);

  if (metadata.length === 0) return null;

  return (
    <div className="anatomy-key-meta">
      {metadata.map((item) => (
        <span className="pill pill--mono" key={String(item)}>{item}</span>
      ))}
    </div>
  );
}

function formatEnum(value: string) {
  return value.replace(/^native-/, "").replace(/-/g, " ");
}

function renderDom(node: DomNode, depth: number): JSX.Element {
  const children = node.children ?? [];
  const tag = node.tag ?? "div";
  return (
    <ul>
      <li>
        <span>
          {"<"}
          <span className="tag">{tag}</span>
          {node.part && <span className="part-label">part="{node.part}"</span>}
          {bindingPreview(node.bindings)}
          {children.length > 0 ? ">" : " />"}
        </span>
      </li>
      {children.length > 0 && (
        <>
          {children.map((c, i) => (
            <li key={i} style={{ paddingLeft: "var(--fsds-core-spacing-size-05)" }}>
              {renderDom(c, depth + 1)}
            </li>
          ))}
          <li className="muted">
            {"</"}<span className="tag">{tag}</span>{">"}
          </li>
        </>
      )}
    </ul>
  );
}

function bindingPreview(bindings?: Record<string, string>) {
  if (!bindings) return null;
  const keys = Object.keys(bindings);
  if (keys.length === 0) return null;
  return (
    <span className="part-label">
      {keys.slice(0, 2).map((k) => ` ${k}="${bindings[k]}"`)}
      {keys.length > 2 && ` …+${keys.length - 2}`}
    </span>
  );
}
