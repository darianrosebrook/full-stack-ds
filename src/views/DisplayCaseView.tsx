import {
  Component,
  createElement,
  type ErrorInfo,
  type ReactNode,
} from "react";
import * as DS from "@full-stack-ds/react";
import { defaultPropsFromContract, childLabel } from "../runtime/demos";
import { resolveRootComponent } from "../lib/usage-registry";
import placeholderUrl from "../assets/placeholder.svg";
import type {
  Bundle,
  ComponentBundle,
  UsagePropValue,
} from "../types/data";

interface DisplayCaseViewProps {
  bundle: Bundle;
}

type VariantCase = {
  id: string;
  label: string;
  props: Record<string, UsagePropValue>;
};

const CATEGORY_ORDER = [
  "action",
  "input",
  "surface",
  "feedback",
  "display",
  "glyph",
  "structure",
  "unknown",
];

export function DisplayCaseView({ bundle }: DisplayCaseViewProps) {
  const groups = groupComponents(bundle.components);

  return (
    <div className="display-case-page">
      <header className="display-case-header">
        <div>
          <p className="display-case-kicker">Internal visual audit</p>
          <h1 className="display-case-title">Display Case</h1>
        </div>
        <dl className="display-case-stats" aria-label="Display case summary">
          <div>
            <dt>Components</dt>
            <dd>{bundle.components.length}</dd>
          </div>
          <div>
            <dt>Families</dt>
            <dd>{groups.length}</dd>
          </div>
        </dl>
      </header>

      <div className="display-case-groups">
        {groups.map((group) => (
          <section className="display-case-family" key={group.category}>
            <div className="display-case-family-header">
              <h2>{formatLabel(group.category)}</h2>
              <span>{group.components.length}</span>
            </div>
            <div className="display-case-grid">
              {group.components.map((component) => (
                <ComponentTile component={component} key={component.name} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ComponentTile({ component }: { component: ComponentBundle }) {
  const cases = variantCases(component);

  return (
    <article className="display-case-tile">
      <div className="display-case-tile-header">
        <div>
          <h3>{component.name}</h3>
          <p>{component.contract.layer}</p>
        </div>
        <span>{caseCountLabel(cases.length)}</span>
      </div>

      <div className="display-case-samples">
        {cases.map((variantCase) => (
          <section className="display-case-sample" key={variantCase.id}>
            <div className="display-case-sample-label">{variantCase.label}</div>
            <div className="display-case-stage">
              <SampleBoundary componentName={component.name} caseLabel={variantCase.label}>
                {renderComponentSample(component, variantCase.props)}
              </SampleBoundary>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function renderComponentSample(
  component: ComponentBundle,
  overrideProps: Record<string, UsagePropValue>,
): ReactNode {
  const Root = resolveRootComponent(`fsds.${component.name}`);
  if (!Root) {
    return <code className="display-case-fallback">Missing React export</code>;
  }

  const props = {
    ...sampleProps(component),
    ...overrideProps,
  };

  if (component.name === "Table") {
    return renderTableSample(props);
  }

  const child = childLabel(component);
  return child ? createElement(Root, props, child) : createElement(Root, props);
}

function renderTableSample(props: Record<string, UsagePropValue>) {
  return (
    <DS.Table {...props} ariaLabel="Display case table">
      <DS.TableCaption>Quarterly usage</DS.TableCaption>
      <DS.TableHead>
        <DS.TableRow>
          <DS.TableHeaderCell scope="col">Metric</DS.TableHeaderCell>
          <DS.TableHeaderCell scope="col">Value</DS.TableHeaderCell>
        </DS.TableRow>
      </DS.TableHead>
      <DS.TableBody>
        <DS.TableRow>
          <DS.TableCell>Active users</DS.TableCell>
          <DS.TableCell>12,480</DS.TableCell>
        </DS.TableRow>
      </DS.TableBody>
    </DS.Table>
  );
}

function sampleProps(component: ComponentBundle): Record<string, UsagePropValue> {
  const props = defaultPropsFromContract(component) as Record<string, UsagePropValue>;

  switch (component.name) {
    case "TextField":
      props.label = "Email address";
      props.description = "Use a work email for account recovery.";
      props.name = "email";
      props.type = "email";
      break;
    case "Input":
      props.name = "email";
      props.type = "email";
      props.placeholder = "you@example.com";
      break;
    case "Checkbox":
      props.name = "terms";
      props.value = "accepted";
      break;
    case "Switch":
      props.name = "notifications";
      break;
    case "ToggleSwitch":
      props.ariaLabel = "Enable notifications";
      break;
    case "Progress":
      props.value = 64;
      props.label = "Upload progress";
      break;
    case "Spinner":
      props.label = "Loading";
      break;
    case "Image":
      props.src = placeholderUrl;
      props.alt = "Decorative placeholder";
      props.width = 240;
      props.height = 135;
      break;
    case "Avatar":
      props.name = "Jordan Rivera";
      break;
  }

  return props;
}

function variantCases(component: ComponentBundle): VariantCase[] {
  const cases: VariantCase[] = [
    {
      id: "default",
      label: "default",
      props: {},
    },
  ];

  const variants = component.contract.variants ?? {};
  for (const [axis, values] of Object.entries(variants)) {
    for (const value of values) {
      cases.push({
        id: `${axis}-${value}`,
        label: `${axis}=${value}`,
        props: { [axis]: value },
      });
    }
  }

  return cases;
}

function groupComponents(components: ComponentBundle[]) {
  const byCategory = new Map<string, ComponentBundle[]>();
  for (const component of components) {
    const category = component.contract.category ?? "unknown";
    const bucket = byCategory.get(category) ?? [];
    bucket.push(component);
    byCategory.set(category, bucket);
  }

  return Array.from(byCategory.entries())
    .sort(([a], [b]) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? CATEGORY_ORDER.length : ai) -
        (bi === -1 ? CATEGORY_ORDER.length : bi);
    })
    .map(([category, grouped]) => ({
      category,
      components: grouped.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

function formatLabel(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function caseCountLabel(count: number): string {
  return count === 1 ? "1 sample" : `${count} samples`;
}

class SampleBoundary extends Component<
  { componentName: string; caseLabel: string; children: ReactNode },
  { message: string | null }
> {
  state = { message: null };

  static getDerivedStateFromError(error: unknown) {
    return {
      message: error instanceof Error ? error.message : "Render failed",
    };
  }

  componentDidCatch(_error: unknown, _info: ErrorInfo) {
    // The display case is an audit surface: one broken component sample should
    // stay visible as evidence instead of taking down the whole grid.
  }

  render() {
    if (this.state.message) {
      return (
        <code className="display-case-fallback">
          {this.props.componentName} / {this.props.caseLabel}: {this.state.message}
        </code>
      );
    }
    return this.props.children;
  }
}
