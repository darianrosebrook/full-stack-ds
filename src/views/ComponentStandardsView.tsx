import { Tabs, TabsList, TabsTab, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@full-stack-ds/react";
import { buildHref, type StandardsTab } from "../router";
import { CodeViewer } from "../components/CodeViewer";

interface ComponentStandardsViewProps {
  tab: StandardsTab;
}

const TABS: { value: StandardsTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "anatomy", label: "Anatomy" },
  { value: "props", label: "Props & API" },
  { value: "states", label: "States & variants" },
  { value: "usage", label: "Usage" },
  { value: "accessibility", label: "Accessibility" },
];

function handleTabChange(next: string) {
  const tab = next as StandardsTab;
  window.location.hash = buildHref({ kind: "standards", tab }).slice(1);
}

export function ComponentStandardsView({ tab }: ComponentStandardsViewProps) {
  return (
    <div className="page">
      <p className="page-eyebrow">Standards · Components</p>
      <h1 className="page-title">Component standards</h1>
      <p className="page-lede">
        Component standards ensure every UI element in the system is robust,
        accessible, and consistent. The categories here — anatomy, props,
        states, usage, accessibility — are the dimensions the system holds
        every component to before it ships.
      </p>

      <Tabs
        appearance="pills"
        value={tab}
        onValueChange={handleTabChange}
        aria-label="Component standards topic"
        className="fw-tabs"
      >
        <TabsList>
          {TABS.map((t) => (
            <TabsTab key={t.value} value={t.value} className="fw-tab">
              {t.label}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>

      <div style={{ marginTop: "var(--fsds-core-spacing-size-07)" }}>
        {tab === "overview" && <OverviewPanel />}
        {tab === "anatomy" && <AnatomyPanel />}
        {tab === "props" && <PropsPanel />}
        {tab === "states" && <StatesPanel />}
        {tab === "usage" && <UsagePanel />}
        {tab === "accessibility" && <AccessibilityPanel />}
      </div>
    </div>
  );
}

function OverviewPanel() {
  return (
    <article>
      <h2>Why component standards exist</h2>
      <p>
        Standards are what stops a design system from becoming &ldquo;a folder
        of components that almost agree.&rdquo; They turn implicit expectations
        — what counts as a complete component, what its API looks like, how it
        behaves under stress, what it commits to for accessibility — into
        explicit, checkable criteria. Once they&apos;re explicit, they can be
        enforced by tooling, reviewed in PRs, and reasoned about by people who
        weren&apos;t in the room when the component was designed.
      </p>

      <h2>The five dimensions</h2>
      <ul>
        <li>
          <strong>Anatomy</strong> — what parts the component has, what
          they&apos;re named, and how they nest. This is the shared vocabulary
          that designers and engineers use to talk about the component.
        </li>
        <li>
          <strong>Props &amp; API</strong> — the surface the component exposes
          to its consumers. Stability here is the most expensive thing to get
          wrong; renaming a prop is a breaking change for every consumer.
        </li>
        <li>
          <strong>States &amp; variants</strong> — the interactive states
          (hover, focus, active, disabled, loading, error) and the visual
          variants (primary, secondary, ghost, danger) the component supports.
          Both must be defined, documented, and visually exercised.
        </li>
        <li>
          <strong>Usage</strong> — the dos and don&apos;ts. When is this
          component the right answer? When isn&apos;t it? Usage guidance is
          how the system scales without funnelling every decision through the
          system team.
        </li>
        <li>
          <strong>Accessibility</strong> — the non-negotiable floor. Every
          component meets WCAG 2.1 AA, supports keyboard operation, exposes
          correct ARIA semantics, and works with the assistive technologies
          its target users actually rely on.
        </li>
      </ul>

      <h2>How the dimensions relate</h2>
      <p>
        These aren&apos;t five independent checklists — they reinforce each
        other. Anatomy defines what props can target. Props define which states
        and variants exist. States define what the component must announce to
        assistive tech. Usage guidance is the human-readable summary of all of
        the above, and accessibility is the constraint that runs through every
        layer.
      </p>
      <p>
        Getting one dimension right while neglecting the others produces
        components that are individually plausible but collectively
        inconsistent — different anatomies for similar widgets, the same prop
        name meaning different things in different components, an accessible
        focus state on the button but not on the segmented control.
      </p>

      <h2>How to use this surface</h2>
      <ul>
        <li>
          When <strong>building a new component</strong>: walk every tab in
          order. Each one is a gate the component must pass before it&apos;s
          considered ready.
        </li>
        <li>
          When <strong>reviewing a PR</strong>: use the tabs as a checklist.
          A change that touches anatomy or props is usually a breaking change
          and needs explicit justification.
        </li>
        <li>
          When <strong>auditing the system</strong>: compare components
          against each other through the lens of one tab at a time —
          e.g. &ldquo;do all five framework emissions of Button name the parts
          the same way?&rdquo;
        </li>
      </ul>
    </article>
  );
}

function AnatomyPanel() {
  return (
    <article>
      <h2>Why anatomy matters</h2>
      <p>
        Component anatomy breaks down complex components into their core parts,
        making them easier to understand, document, and maintain. By
        identifying the essential elements and their relationships, we create
        a shared vocabulary and enable consistent implementation across teams
        and frameworks.
      </p>
      <ul>
        <li>
          <strong>Clarity:</strong> a clear picture of what makes up a
          component.
        </li>
        <li>
          <strong>Consistency:</strong> standardized terminology across the
          team and across framework emissions.
        </li>
        <li>
          <strong>Flexibility:</strong> understanding the parts is what enables
          slot-based composition and substitution.
        </li>
        <li>
          <strong>Documentation:</strong> a visual and textual reference for
          implementation, useful to both designers and engineers.
        </li>
      </ul>

      <h2>The anatomy hierarchy</h2>

      <h3>1. Root element</h3>
      <p>The outermost container that wraps all component parts.</p>
      <CodeViewer
        code={`// Button root
<button className="button" {...props}>
  {/* all parts contained within */}
</button>

// Card root
<div className="card">
  {/* card parts */}
</div>`}
      />

      <h3>2. Primary parts</h3>
      <p>Essential elements that define the component&apos;s purpose.</p>
      <CodeViewer
        code={`// Button primary parts
<button className="button">
  <span className="button__icon">{icon}</span>
  <span className="button__text">{children}</span>
</button>

// Card primary parts
<div className="card">
  <div className="card__header">{title}</div>
  <div className="card__body">{content}</div>
  <div className="card__footer">{actions}</div>
</div>`}
      />

      <h3>3. Optional parts</h3>
      <p>Parts that may or may not be present, depending on props or state.</p>
      <CodeViewer
        code={`<button className="button">
  {icon && <span className="button__icon">{icon}</span>}
  <span className="button__text">{children}</span>
  {loading && <span className="button__spinner" aria-hidden />}
</button>`}
      />

      <h2>Naming conventions</h2>

      <h3>BEM-style naming</h3>
      <CodeViewer
        code={`// Block: component name
.button { }
.card { }

// Element: part of component
.button__icon { }
.button__text { }
.card__header { }

// Modifier: variant or state
.button--primary { }
.button--disabled { }
.card--elevated { }`}
      />

      <h3>Semantic naming</h3>
      <p>Use semantic names that describe purpose, not appearance.</p>
      <CodeViewer
        code={`// GOOD: semantic
.card__header { }
.card__body { }
.card__footer { }

// BAD: appearance-based
.card__top { }
.card__middle { }
.card__bottom { }`}
      />

      <h2>Documentation requirements</h2>
      <ul>
        <li><strong>Visual diagram</strong> showing the parts in situ</li>
        <li><strong>Part list</strong> with names and descriptions</li>
        <li><strong>Hierarchy</strong> describing how parts nest</li>
        <li><strong>Required vs optional</strong> for each part</li>
        <li><strong>Code examples</strong> mapping parts to source</li>
      </ul>

      <h2>Layer-specific anatomy</h2>

      <h3>Primitives</h3>
      <p>Simple anatomy with minimal parts.</p>
      <CodeViewer
        code={`// Button (Primitive)
Root: button
Parts:
  - text (required): button label
  - icon (optional): leading icon`}
      />

      <h3>Compounds</h3>
      <p>Coordinate multiple primitives.</p>
      <CodeViewer
        code={`// TextField (Compound)
Root: div.field
Parts:
  - label  (required): label element
  - input  (required): Input primitive
  - hint   (optional): helper text
  - error  (optional): error message`}
      />

      <h3>Composers</h3>
      <p>Complex anatomy with orchestrated, nested parts.</p>
      <CodeViewer
        code={`// Modal (Composer)
Root: div.modal
Parts:
  - overlay   (required): backdrop
  - container (required): main modal container
    - header  (optional): title area
    - body    (required): content area
    - footer  (optional): action area
      - actions (optional): button group`}
      />
    </article>
  );
}

function PropsPanel() {
  return (
    <article>
      <h2>Why props matter</h2>
      <p>
        Component props define the interface between the design system and the
        teams using it. Well-designed props enable adoption, prevent misuse,
        and scale with complexity. Poorly designed props lead to prop
        explosion, inconsistent usage, and maintenance nightmares.
      </p>
      <ul>
        <li>
          <strong>Usability:</strong> can developers understand and use the
          component without reading its implementation?
        </li>
        <li>
          <strong>Flexibility:</strong> does the API accommodate common cases
          without requiring workarounds?
        </li>
        <li>
          <strong>Consistency:</strong> do similar components follow similar
          prop patterns?
        </li>
        <li>
          <strong>Maintainability:</strong> can the component evolve without
          breaking consumers?
        </li>
      </ul>

      <h2>Core principles</h2>

      <h3>1. Names describe purpose, not implementation</h3>
      <CodeViewer
        code={`// BAD: implementation detail
<Button variant="blue" />

// GOOD: purpose-driven
<Button variant="primary" />`}
      />

      <h3>2. Follow layer-appropriate patterns</h3>
      <ul>
        <li>
          <strong>Primitives:</strong> minimal props, stable API, predictable
          behavior.
        </li>
        <li>
          <strong>Compounds:</strong> props that coordinate sub-parts, without
          prop explosion.
        </li>
        <li>
          <strong>Composers:</strong> composition patterns (slots, render
          props, context) instead of many props.
        </li>
      </ul>

      <h3>3. Use semantic types</h3>
      <CodeViewer
        code={`// BAD: generic
size: 'small' | 'medium' | 'large'
variant: '1' | '2' | '3'

// GOOD: semantic
size: 'sm' | 'md' | 'lg'
variant: 'primary' | 'secondary' | 'ghost'`}
      />

      <h3>4. Provide sensible defaults</h3>
      <CodeViewer
        code={`interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'; // defaults to 'primary'
  size?:    'sm' | 'md' | 'lg';                // defaults to 'md'
  disabled?: boolean;                          // defaults to false
}

// Simple usage doesn't need every prop
<Button>Click me</Button>

// Complex usage can still customize
<Button variant="ghost" size="sm" disabled>Cancel</Button>`}
      />

      <h2>Common patterns</h2>

      <h3>Variant pattern</h3>
      <CodeViewer
        code={`interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

<Button variant="primary">Save</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Cancel</Button>`}
      />

      <h3>Size pattern (used consistently across components)</h3>
      <CodeViewer
        code={`<Button size="sm">Small</Button>
<Input  size="sm" />
<Avatar size="sm" />`}
      />

      <h3>State props (boolean for binary states)</h3>
      <CodeViewer
        code={`interface ButtonProps {
  disabled?: boolean;
  loading?:  boolean;
  active?:   boolean;
}

<Button disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>`}
      />

      <h2>Anti-patterns</h2>

      <h3>1. Prop explosion</h3>
      <CodeViewer
        code={`// BAD: 15+ props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  shadow?: boolean;
  uppercase?: boolean;
  // ... and more
}

// GOOD: use composition
<Button variant="primary" icon={<Icon name="check" />} iconPosition="left">
  Save
</Button>

// or extract to compound siblings
<ButtonGroup>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</ButtonGroup>`}
      />

      <h3>2. Magic-string props</h3>
      <CodeViewer
        code={`// BAD: no type safety
<Button variant="primay" /> // typo, no error

// GOOD: TypeScript unions
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
interface ButtonProps { variant?: ButtonVariant }

<Button variant="primay" /> // TypeScript error`}
      />

      <h3>3. Props that control multiple concerns</h3>
      <CodeViewer
        code={`// BAD: one prop controls many things
<Button mode="loading-primary-large" />

// GOOD: separate concerns
<Button variant="primary" size="lg" loading />`}
      />

      <h3>4. Inconsistent names across siblings</h3>
      <CodeViewer
        code={`// BAD
<Button size="sm" />
<Input  scale="sm" />
<Avatar dimension="sm" />

// GOOD
<Button size="sm" />
<Input  size="sm" />
<Avatar size="sm" />`}
      />

      <h2>Layer-specific guidelines</h2>

      <h3>Primitives</h3>
      <p>Minimal, stable props. Predictable behavior.</p>
      <CodeViewer
        code={`interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?:    'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?:  () => void;
  children:  React.ReactNode;
}`}
      />

      <h3>Compounds</h3>
      <p>Coordinate sub-parts without prop explosion. Delegate via slots.</p>
      <CodeViewer
        code={`interface TextFieldProps {
  label?: string;
  error?: string;
  hint?:  string;
  // Delegate to Input primitive
  inputProps?: InputProps;
}

<TextField label="Email" />
<TextField label="Email"
           inputProps={{ type: "email", placeholder: "you@example.com" }} />`}
      />

      <h3>Composers</h3>
      <p>Composition patterns, not many props.</p>
      <CodeViewer
        code={`interface ModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  title?:   React.ReactNode;
  children: React.ReactNode;
  footer?:  React.ReactNode; // slot for customization
}

<Modal isOpen={isOpen} onClose={handleClose} title="Confirm">
  <p>Are you sure?</p>
  <Modal.Footer>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </Modal.Footer>
</Modal>`}
      />

      <h2>Documentation requirements</h2>
      <ul>
        <li>
          <strong>Type:</strong> TypeScript type definition.
        </li>
        <li>
          <strong>Required vs optional:</strong> whether the prop is required.
        </li>
        <li>
          <strong>Default:</strong> default value when optional.
        </li>
        <li>
          <strong>Description:</strong> what the prop does and when to use it.
        </li>
        <li>
          <strong>Examples:</strong> at least one code example per prop.
        </li>
      </ul>

      <h2>Migration &amp; evolution</h2>
      <p>
        Adding a prop: optional, sensible default, documented, with examples,
        considered against whether composition would be a better fit.
        Deprecating a prop: JSDoc <code>@deprecated</code> with a migration
        path, support both old and new for a grace period (we target six
        months), remove after the period elapses.
      </p>
      <CodeViewer
        code={`interface ButtonProps {
  /** @deprecated Use variant="primary" instead */
  primary?: boolean;

  /** Visual style variant @default 'primary' */
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ primary, variant, ...props }: ButtonProps) {
  const finalVariant = variant ?? (primary ? 'primary' : undefined);
  if (primary) {
    console.warn('Button "primary" is deprecated; use variant="primary"');
  }
  return <button className={variantStyles[finalVariant]} {...props} />;
}`}
      />
    </article>
  );
}

function StatesPanel() {
  return (
    <article>
      <h2>Why states &amp; variants matter</h2>
      <p>
        Components exist in multiple states and variants. States represent
        interactive conditions (hover, focus, disabled). Variants represent
        visual style options (primary, secondary, ghost). Clearly defining
        and documenting these ensures consistent implementation and
        predictable user experiences.
      </p>
      <ul>
        <li>
          <strong>Consistency:</strong> the same state behaves the same way
          across components.
        </li>
        <li>
          <strong>Predictability:</strong> users know what to expect.
        </li>
        <li>
          <strong>Accessibility:</strong> states communicate meaning to all
          users, not just sighted ones.
        </li>
        <li>
          <strong>Maintainability:</strong> clear definitions prevent drift.
        </li>
      </ul>

      <h2>Component states</h2>

      <h3>Default state</h3>
      <p>The base, unmodified state of the component.</p>
      <CodeViewer
        code={`.button {
  background: var(--semantic-color-background-primary);
  color:      var(--semantic-color-foreground-primary);
}`}
      />

      <h3>Interactive states</h3>
      <ul>
        <li><strong>Hover</strong> — pointer over the element</li>
        <li><strong>Focus</strong> — element has keyboard focus</li>
        <li><strong>Active</strong> — element is being activated (click/press)</li>
        <li><strong>Pressed</strong> — element is in a pressed/selected state (toggles)</li>
      </ul>
      <CodeViewer
        code={`.button {
  &:hover         { background: var(--semantic-color-background-primary-hover); }
  &:focus-visible { outline: 2px solid var(--semantic-color-border-focus); outline-offset: 2px; }
  &:active        { background: var(--semantic-color-background-primary-active); }
  &[aria-pressed="true"] { background: var(--semantic-color-background-primary-pressed); }
}`}
      />

      <h3>Functional states</h3>
      <ul>
        <li><strong>Disabled</strong> — not interactive</li>
        <li><strong>Loading</strong> — async work in flight</li>
        <li><strong>Error</strong> — invalid input or operation</li>
        <li><strong>Success</strong> — completed action</li>
      </ul>
      <CodeViewer
        code={`<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
<Input  error="Invalid email" />
<Input  success />

.button {
  &:disabled            { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
  &[aria-busy="true"]   { opacity: 0.7; cursor: wait; }
}`}
      />

      <h3>State combinations</h3>
      <p>Components can have multiple states simultaneously. Decide which wins when they conflict.</p>
      <CodeViewer
        code={`<Button disabled loading>Processing...</Button>

.button:disabled {
  pointer-events: none;
  &:hover { background: inherit; }   /* disabled overrides hover */
}`}
      />

      <h2>Component variants</h2>

      <h3>Visual variants</h3>
      <CodeViewer
        code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

.button {
  &--primary   { background: var(--semantic-color-background-primary);   color: var(--semantic-color-foreground-on-primary); }
  &--secondary { background: var(--semantic-color-background-secondary); color: var(--semantic-color-foreground-on-secondary); }
  &--ghost     { background: transparent; border: 1px solid var(--semantic-color-border-default); }
  &--danger    { background: var(--semantic-color-background-error);     color: var(--semantic-color-foreground-on-error); }
}`}
      />

      <h3>Size variants</h3>
      <CodeViewer
        code={`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

.button {
  &--sm { padding: var(--semantic-spacing-padding-button-sm); font-size: var(--semantic-typography-size-button-sm); }
  &--md { padding: var(--semantic-spacing-padding-button-md); font-size: var(--semantic-typography-size-button-md); }
  &--lg { padding: var(--semantic-spacing-padding-button-lg); font-size: var(--semantic-typography-size-button-lg); }
}`}
      />

      <h2>State documentation</h2>
      <ul>
        <li><strong>All states:</strong> default, interactive, functional.</li>
        <li><strong>Visual examples:</strong> show each state in situ.</li>
        <li><strong>Trigger conditions:</strong> what causes each state.</li>
        <li><strong>State combinations:</strong> which combinations are valid and how they interact.</li>
        <li><strong>Accessibility:</strong> how each state is communicated to assistive tech.</li>
      </ul>

      <h3>State matrix</h3>
      <CodeViewer
        code={`/**
 * Button state matrix
 *
 * States:   default | hover | focus | active | disabled | loading
 * Variants: primary | secondary | ghost | danger
 *
 * Valid combinations:
 *   - primary  + default / hover / focus / active / disabled / loading
 *   - secondary + ... (same set)
 *   - ...
 *
 * Invalid combinations:
 *   - disabled + hover     (disabled prevents hover)
 *   - disabled + active    (disabled prevents active)
 */`}
      />

      <h2>Controlled vs uncontrolled</h2>
      <p>Document whether the component owns its state or expects the parent to.</p>
      <CodeViewer
        code={`// Uncontrolled: component owns its state
<Toggle defaultChecked />

// Controlled: parent owns the state
<Toggle checked={isOn} onChange={setIsOn} />`}
      />

      <h2>Common pitfalls</h2>

      <h3>1. Missing focus state</h3>
      <CodeViewer
        code={`// BAD: no focus state — keyboard users have no anchor
.button { &:hover { background: blue; } }

// GOOD
.button {
  &:hover         { background: blue; }
  &:focus-visible { outline: 2px solid blue; }
}`}
      />

      <h3>2. Inconsistent state behavior across components</h3>
      <CodeViewer
        code={`// BAD: different opacity for the same logical state
.button.disabled { opacity: 0.5; }
.input.disabled  { opacity: 0.3; }

// GOOD: drive from a single token
.button:disabled, .input:disabled {
  opacity: var(--semantic-opacity-disabled);
  cursor: not-allowed;
}`}
      />

      <h3>3. State conflicts</h3>
      <CodeViewer
        code={`// BAD: hover still wins when disabled
.button {
  &:disabled { opacity: 0.5; }
  &:hover    { background: blue; }
}

// GOOD: disabled is terminal
.button:disabled {
  opacity: 0.5;
  pointer-events: none;
  &:hover { background: inherit; }
}`}
      />
    </article>
  );
}

function UsagePanel() {
  return (
    <article>
      <h2>Why usage guidelines matter</h2>
      <p>
        Usage guidelines help teams use components correctly and consistently.
        Clear dos and don&apos;ts prevent misuse, reduce support burden, and
        ensure components deliver their intended value. They bridge the gap
        between what a component <em>can</em> do and what it <em>should</em>{" "}
        do in a particular context.
      </p>
      <ul>
        <li><strong>Prevent misuse:</strong> clear guidance reduces mistakes.</li>
        <li><strong>Enable self-service:</strong> teams can use components without asking.</li>
        <li><strong>Maintain consistency:</strong> similar contexts use similar patterns.</li>
        <li><strong>Reduce support load:</strong> fewer questions and issues reach the system team.</li>
      </ul>

      <h2>Guideline structure</h2>

      <h3>1. When to use</h3>
      <CodeViewer
        code={`/**
 * Button usage
 *
 * Use Button for:
 *   - Primary actions (Save, Submit, Confirm)
 *   - Secondary actions (Cancel, Back)
 *   - Destructive actions (Delete, Remove)
 *
 * Don't use Button for:
 *   - Text links (use Link)
 *   - Icon-only actions without labels (use IconButton)
 *   - Toggle switches (use Switch)
 *   - Navigation menus (use NavLink)
 */`}
      />

      <h3>2. Contextual recommendations</h3>
      <CodeViewer
        code={`/**
 * Button context guidelines
 *
 * Forms:
 *   - primary variant for submit
 *   - secondary variant for cancel
 *   - bottom-right placement
 *   - loading state during submission
 *
 * Modals:
 *   - primary variant for confirmation action
 *   - ghost variant for cancel
 *   - footer placement
 *   - keyboard navigation must work
 *
 * Toolbars:
 *   - appropriate size for space constraints
 *   - group related actions
 *   - icon buttons when space is limited
 */`}
      />

      <h3>3. Do&apos;s and don&apos;ts</h3>

      <h4>Buttons</h4>
      <p><strong>Do</strong></p>
      <ul>
        <li>Use descriptive labels that indicate the action outcome (&ldquo;Save changes&rdquo; not &ldquo;OK&rdquo;).</li>
        <li>Use primary variant for the main action on the screen.</li>
        <li>Provide loading states for async actions.</li>
        <li>Use appropriate size for the context (small in toolbars, medium in forms, large in marketing surfaces).</li>
      </ul>
      <p><strong>Don&apos;t</strong></p>
      <ul>
        <li>Use buttons for navigation — use Link.</li>
        <li>Use multiple primary buttons on the same screen.</li>
        <li>Use unclear labels (&ldquo;OK&rdquo;, &ldquo;Click here&rdquo;).</li>
        <li>Remove focus styles — that breaks accessibility.</li>
      </ul>

      <h4>Form controls</h4>
      <p><strong>Do</strong></p>
      <ul>
        <li>Always associate labels with inputs.</li>
        <li>Provide helpful, specific error messages.</li>
        <li>Use appropriate input types (<code>email</code>, <code>tel</code>, <code>url</code>) for the right keyboards and validation.</li>
        <li>Group related fields logically.</li>
      </ul>
      <p><strong>Don&apos;t</strong></p>
      <ul>
        <li>Use placeholder text as the label.</li>
        <li>Hide validation errors until submit.</li>
        <li>Use generic &ldquo;Error&rdquo; messages.</li>
        <li>Require formatting users must guess.</li>
      </ul>

      <h4>Modals / dialogs</h4>
      <p><strong>Do</strong></p>
      <ul>
        <li>Use for critical confirmations.</li>
        <li>Provide a clear title and description.</li>
        <li>Include primary and secondary actions.</li>
        <li>Trap focus and manage keyboard navigation.</li>
      </ul>
      <p><strong>Don&apos;t</strong></p>
      <ul>
        <li>Use modals for non-critical information (use Toast).</li>
        <li>Nest modals within modals.</li>
        <li>Use modals for navigation.</li>
        <li>Block users from closing the modal.</li>
      </ul>

      <h2>Composition guidelines</h2>
      <p>Use composition for complex use cases rather than reaching for more props:</p>
      <CodeViewer
        code={`// GOOD: compose for complex cases
<Card>
  <Card.Header>
    <Card.Title>User profile</Card.Title>
    <Card.Actions>
      <Button variant="ghost" size="sm">Edit</Button>
    </Card.Actions>
  </Card.Header>
  <Card.Body>
    <TextField label="Name" />
    <TextField label="Email" />
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Save</Button>
    <Button variant="secondary">Cancel</Button>
  </Card.Footer>
</Card>

// BAD: every variation as a prop
<Card
  title="User profile"
  hasEditButton
  fields={[...]}
  hasFooter
  footerActions={[...]}
/>`}
      />

      <h2>Content guidelines</h2>
      <CodeViewer
        code={`// GOOD: clear, descriptive labels
<Button>Save changes</Button>
<Button variant="danger">Delete account</Button>
<Input label="Email address" placeholder="you@example.com" />

// BAD: vague labels
<Button>OK</Button>
<Button variant="danger">Delete</Button>
<Input placeholder="Enter text" />`}
      />

      <h2>Common mistakes</h2>

      <h3>1. Over-customization</h3>
      <CodeViewer
        code={`// BAD
<Button
  style={{
    borderRadius: '50px',
    backgroundColor: '#ff0000',
    fontSize: '20px',
    padding: '30px',
  }}
>
  Click me
</Button>

// GOOD: use system variants
<Button variant="primary" size="lg">Click me</Button>`}
      />

      <h3>2. Ignoring context</h3>
      <CodeViewer
        code={`// BAD: button for navigation
<Button onClick={() => router.push('/about')}>Learn more</Button>

// GOOD: link for navigation
<Link href="/about">Learn more</Link>`}
      />

      <h3>3. Missing error handling</h3>
      <CodeViewer
        code={`// BAD
<TextField label="Email" />

// GOOD
<TextField
  label="Email"
  error={errors.email}
  hint="We'll never share your email"
/>`}
      />

      <h2>Documentation requirements</h2>
      <p>Every component&apos;s usage guidelines should include:</p>
      <ul>
        <li><strong>When to use</strong> — appropriate use cases.</li>
        <li><strong>When not to use</strong> — inappropriate use cases.</li>
        <li><strong>Do&apos;s and don&apos;ts</strong> — clear, specific examples.</li>
        <li><strong>Code examples</strong> — real-world usage patterns.</li>
        <li><strong>Common mistakes</strong> — what to avoid.</li>
        <li><strong>Accessibility</strong> — considerations specific to the component.</li>
      </ul>
    </article>
  );
}

function AccessibilityPanel() {
  return (
    <article>
      <h2>Why accessibility belongs in the system</h2>
      <p>
        Accessibility is more than a checklist — it&apos;s a mindset that
        enhances design decision-making and expands usability for everyone.
        When accessibility decisions are encoded at the system level
        (primitives, compounds, composers, tokens), they become defaults that
        every product inherits automatically. Teams don&apos;t have to
        remember to check contrast ratios or wire up{" "}
        <code>aria-describedby</code>; the system handles it.
      </p>
      <p>
        This is the difference between &ldquo;audit and fix&rdquo; and
        &ldquo;accessible by default.&rdquo; Audit-and-fix scales linearly
        with product surface — every new feature requires another a11y
        review. Accessible-by-default scales with the system — fix the
        primitive once and every downstream consumer benefits.
      </p>

      <h2>Why it matters</h2>
      <ul>
        <li>
          <strong>Legal compliance:</strong> meeting WCAG 2.1 Level AA is a
          baseline expectation in most jurisdictions.
        </li>
        <li>
          <strong>User inclusion:</strong> a real percentage of every
          product&apos;s users have a disability — temporary, situational, or
          permanent.
        </li>
        <li>
          <strong>Better UX for everyone:</strong> keyboard support,
          sufficient contrast, and clear error messaging improve experience
          for users without disabilities too.
        </li>
        <li>
          <strong>Business value:</strong> expanding who can use the product
          expands the market it can reach.
        </li>
      </ul>

      <h2>WCAG 2.1+ and the POUR model</h2>
      <p>
        All components in the system target WCAG 2.1 Level AA. The four POUR
        principles structure how those requirements decompose:
      </p>
      <ul>
        <li>
          <strong>Perceivable:</strong> text alternatives, captions,
          sufficient color contrast, content that doesn&apos;t rely on color
          or sensory characteristics alone.
        </li>
        <li>
          <strong>Operable:</strong> keyboard accessibility, no
          seizure-inducing content, sufficient time for interactions,
          predictable navigation.
        </li>
        <li>
          <strong>Understandable:</strong> readable text, predictable
          behavior, input assistance that explains errors and suggests
          corrections.
        </li>
        <li>
          <strong>Robust:</strong> compatible with current and future
          assistive technologies, valid markup, well-formed ARIA.
        </li>
      </ul>

      <h2>Core requirements</h2>

      <h3>1. Semantic HTML</h3>
      <p>
        Use semantic HTML elements that convey meaning. Native elements come
        with native a11y; generic elements don&apos;t.
      </p>
      <CodeViewer
        code={`// BAD
<div onClick={handleClick}>Click me</div>
<span role="button">Submit</span>

// GOOD
<button onClick={handleClick}>Click me</button>
<button type="submit">Submit</button>`}
      />

      <h3>2. Keyboard navigation</h3>
      <CodeViewer
        code={`// Native button already handles keyboard
<button onClick={handleClick}>Click me</button>

// Custom interactive surface — replicate the contract
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>`}
      />

      <h3>3. ARIA attributes</h3>
      <CodeViewer
        code={`// Complex composer
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm action</h2>
  <p id="dialog-description">Are you sure you want to continue?</p>
</div>

// Dynamic content
<div aria-live="polite" aria-atomic="true">
  {loading ? 'Loading...' : 'Content loaded'}
</div>`}
      />

      <h3>4. Color contrast</h3>
      <Table className="props-table" ariaLabel="Color contrast requirements">
        <TableHead>
          <TableRow><TableHeaderCell>Content</TableHeaderCell><TableHeaderCell>Minimum (AA)</TableHeaderCell><TableHeaderCell>Enhanced (AAA)</TableHeaderCell></TableRow>
        </TableHead>
        <TableBody>
          <TableRow><TableCell>Normal text</TableCell><TableCell>4.5:1</TableCell><TableCell>7:1</TableCell></TableRow>
          <TableRow><TableCell>Large text (≥18pt or ≥14pt bold)</TableCell><TableCell>3:1</TableCell><TableCell>4.5:1</TableCell></TableRow>
          <TableRow><TableCell>UI components &amp; graphical objects</TableCell><TableCell>3:1</TableCell><TableCell>—</TableCell></TableRow>
        </TableBody>
      </Table>

      <h3>5. Focus management</h3>
      <CodeViewer
        code={`/* Visible focus indicator */
.button:focus-visible {
  outline: 2px solid var(--semantic-color-border-focus);
  outline-offset: 2px;
}

/* Focus trapping inside a modal (composer territory) */
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    first.focus();
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  return <div ref={modalRef}>{children}</div>;
}`}
      />

      <h2>Component-specific guidelines</h2>

      <h3>Buttons</h3>
      <ul>
        <li>Use the semantic <code>&lt;button&gt;</code> element.</li>
        <li>Provide an accessible label (text content or <code>aria-label</code>).</li>
        <li>Indicate loading state with <code>aria-busy</code>.</li>
        <li>Minimum 44×44 px touch target on coarse pointers.</li>
      </ul>

      <h3>Form controls</h3>
      <ul>
        <li>Associate labels with inputs using <code>htmlFor</code> / <code>id</code>.</li>
        <li>Provide error messages and link them via <code>aria-describedby</code>.</li>
        <li>Use <code>aria-required</code> for required fields.</li>
        <li>Announce validation errors via <code>role=&quot;alert&quot;</code>.</li>
      </ul>

      <h3>Dialogs / modals</h3>
      <ul>
        <li>Use <code>role=&quot;dialog&quot;</code> (or the native <code>&lt;dialog&gt;</code> element).</li>
        <li>Provide <code>aria-labelledby</code> pointing at the title.</li>
        <li>Trap focus inside the modal.</li>
        <li>Return focus to the trigger when closed.</li>
      </ul>

      <h2>Supporting assistive technology</h2>
      <p>
        Assistive technologies — screen readers, switch devices, voice
        control, screen magnifiers, refreshable braille displays — are how a
        substantial slice of users actually interact with the product.
        Supporting them well is mostly a matter of getting the basics right
        and not actively breaking the platform&apos;s defaults.
      </p>

      <h3>Screen readers</h3>
      <ul>
        <li><strong>VoiceOver</strong> — macOS / iOS / iPadOS.</li>
        <li><strong>NVDA</strong> — free, Windows. Default Windows test target.</li>
        <li><strong>JAWS</strong> — commercial, Windows. Still common in enterprise.</li>
        <li><strong>TalkBack</strong> — Android.</li>
      </ul>
      <p>
        Real screen-reader testing means running the actual software, not
        just passing axe. A node can be valid markup, pass automated checks,
        and still produce a confusing experience with VoiceOver. Test the
        flows that matter — sign-in, primary CTAs, error recovery — on at
        least one screen reader before shipping.
      </p>

      <h3>Keyboard navigation</h3>
      <ul>
        <li>Every interactive surface must be reachable and operable with the keyboard alone.</li>
        <li>Tab order should match visual order. If it doesn&apos;t, fix DOM order before reaching for <code>tabindex</code>.</li>
        <li>Avoid positive <code>tabindex</code> values. Use <code>0</code> to make something focusable and <code>-1</code> to remove it from the tab order while keeping it programmatically focusable.</li>
        <li>Composers like menus, listboxes, and toolbars use <strong>roving tabindex</strong> rather than putting every child in the tab order.</li>
      </ul>

      <h3>ARIA: use sparingly, use correctly</h3>
      <p>
        The first rule of ARIA is <em>don&apos;t use ARIA if a native element
        does the job</em>. ARIA layers semantics on top of HTML; native
        elements come with semantics already attached. Reach for ARIA when
        you&apos;re building something the platform doesn&apos;t provide
        (tabs, combobox, custom menu) and follow the WAI-ARIA Authoring
        Practices for the pattern.
      </p>

      <h3>Live regions</h3>
      <ul>
        <li><code>aria-live=&quot;polite&quot;</code> — most updates. Announces when the screen reader is idle.</li>
        <li><code>aria-live=&quot;assertive&quot;</code> — only for truly urgent messages.</li>
        <li><code>role=&quot;alert&quot;</code> — equivalent to assertive; use for inline form errors.</li>
      </ul>

      <h2>Accessibility tokens</h2>
      <p>
        The fastest way to keep accessibility consistent across the system is
        to encode it into the tokens that everything else inherits. For the
        deeper rationale, see{" "}
        <a href={buildHref({ kind: "tokens-philosophy", tab: "accessibility" })}>
          Tokens philosophy → Accessibility by default
        </a>
        . Highlights:
      </p>
      <ul>
        <li>
          <strong>Contrast-aware color pairs</strong> — foreground and
          background tokens are vetted as pairs to guarantee minimum WCAG
          ratios in both light and dark modes.
        </li>
        <li>
          <strong>Reduced-motion durations</strong> — every motion token has
          a <code>reduced</code> variant that the build emits behind{" "}
          <code>@media (prefers-reduced-motion: reduce)</code>.
        </li>
        <li>
          <strong>Minimum target sizes</strong> — interactive target tokens
          enforce a 24 px minimum and 44 px comfortable size per WCAG 2.2.
        </li>
        <li>
          <strong>Focus rings</strong> — width, offset, and color tokens
          drive a consistent focus indicator that adapts to forced-colors
          mode.
        </li>
      </ul>

      <h2>Tooling</h2>

      <h3>Automated testing</h3>
      <p>
        Automated tools catch a meaningful fraction of accessibility
        regressions cheaply — but they miss the ones that need human
        judgment. Run them as a gate; don&apos;t treat a passing axe run as
        proof of accessibility.
      </p>
      <ul>
        <li><strong>axe-core / jest-axe</strong> — unit-test accessibility violations.</li>
        <li><strong>Lighthouse</strong> — page-level audit alongside performance and SEO.</li>
        <li><strong>Playwright a11y assertions</strong> — integration-level checks alongside the existing E2E suite.</li>
      </ul>
      <CodeViewer
        filename="Button.a11y.test.tsx"
        code={`import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});`}
      />

      <h3>Manual testing</h3>
      <ul>
        <li><strong>Screen readers</strong> — VoiceOver on macOS/iOS, NVDA on Windows.</li>
        <li><strong>Keyboard only</strong> — unplug the mouse, navigate the flow end to end.</li>
        <li><strong>Browser zoom &amp; text zoom</strong> — 200% zoom and 200% text-only zoom. Layout breaking under zoom fails AA.</li>
        <li><strong>Forced colors</strong> — Windows High Contrast and equivalents. Custom focus rings often vanish without explicit handling.</li>
        <li><strong>Reduced motion</strong> — toggle the OS setting and confirm animations degrade gracefully.</li>
      </ul>

      <h2>Common pitfalls</h2>

      <h3>1. Missing labels</h3>
      <CodeViewer
        code={`// BAD
<input type="text" />

// GOOD
<label htmlFor="email">Email</label>
<input id="email" type="email" />`}
      />

      <h3>2. Keyboard traps</h3>
      <CodeViewer
        code={`// BAD: focus can't escape
<div onKeyDown={(e) => e.preventDefault()}>...</div>

// GOOD: only handle keys you mean to handle
<div onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>...</div>`}
      />

      <h3>3. Insufficient color contrast</h3>
      <CodeViewer
        code={`// BAD: 1.2:1 contrast — invisible to many users
.button { background: #ccc; color: #ddd; }

// GOOD: drive from semantic tokens, not raw hex
.button {
  background: var(--semantic-color-background-accent);
  color:      var(--semantic-color-foreground-on-accent);
}`}
      />

      <h3>4. Missing accessible names on icon-only controls</h3>
      <CodeViewer
        code={`// BAD: screen reader hears "button"
<button onClick={handleClose}><Icon name="close" /></button>

// GOOD
<button onClick={handleClose} aria-label="Close dialog">
  <Icon name="close" aria-hidden />
</button>`}
      />
    </article>
  );
}
