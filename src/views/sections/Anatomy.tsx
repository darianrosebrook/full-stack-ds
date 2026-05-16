import type { JSX } from "react";
import type { AnatomyDetailed, ComponentContract, DomNode } from "../../types/data";

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
        {parts.map((p) => (
          <div className="anatomy-key-item" key={p}>
            <code>{p}</code>
            <span className="muted">
              {details?.[p]?.description ?? "Anatomy part declared by the contract."}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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
            <li key={i} style={{ paddingLeft: "var(--space-3)" }}>
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
