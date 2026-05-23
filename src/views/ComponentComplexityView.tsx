import { Tabs, TabsList, TabsTab } from "@full-stack-ds/react";
import { buildHref, type ComplexityTab } from "../router";
import { CodeViewer } from "../components/CodeViewer";

interface ComponentComplexityViewProps {
  tab: ComplexityTab;
}

const TABS: { value: ComplexityTab; label: string }[] = [
  { value: "overview", label: "Layered methodology" },
  { value: "primitives", label: "Primitives" },
  { value: "compounds", label: "Compounds" },
  { value: "composers", label: "Composers" },
  { value: "assemblies", label: "Assemblies" },
];

function handleTabChange(next: string) {
  const tab = next as ComplexityTab;
  window.location.hash = buildHref({ kind: "complexity", tab }).slice(1);
}

export function ComponentComplexityView({ tab }: ComponentComplexityViewProps) {
  return (
    <div className="page">
      <p className="page-eyebrow">Standards · Components</p>
      <h1 className="page-title">Designing with layers</h1>
      <p className="page-lede">
        A systems approach to component architecture that anticipates
        complexity before it manifests in code. Four layers — primitives,
        compounds, composers, assemblies — each with a different demand on the
        system and a different governance posture.
      </p>

      <Tabs
        appearance="pills"
        value={tab}
        onValueChange={handleTabChange}
        aria-label="Component complexity topic"
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

      <div style={{ marginTop: "var(--space-6)" }}>
        {tab === "overview" && <OverviewPanel />}
        {tab === "primitives" && <PrimitivesPanel />}
        {tab === "compounds" && <CompoundsPanel />}
        {tab === "composers" && <ComposersPanel />}
        {tab === "assemblies" && <AssembliesPanel />}
      </div>
    </div>
  );
}

function OverviewPanel() {
  return (
    <article>
      <h2>The problem with flat component libraries</h2>
      <p>
        When design systems first take root, they begin with components:
        buttons, inputs, icons, toggles. The goal is consistency, but
        consistency alone doesn&apos;t explain why complexity creeps in. Over
        time, you notice the neat catalog breaks down: forms behave differently
        across contexts, toolbars overflow with actions, editors sprout feature
        walk-throughs, and pagination mutates with ellipses and compact modes.
      </p>
      <p>
        The problem isn&apos;t that your system is &ldquo;messy.&rdquo; The
        problem is that you&apos;re seeing{" "}
        <strong>composition at work</strong>. Complexity in digital interfaces
        rarely comes from primitives themselves — it emerges when small parts
        are combined, orchestrated, and pushed against application workflows.
      </p>
      <p>
        To build systems that endure, you need a lens that helps you anticipate
        this layering before it manifests in code. That&apos;s what the layered
        component methodology provides: a way to classify, compose, and govern
        components across four levels of scale.
      </p>

      <h2>The four layers</h2>
      <LayerGrid
        layers={[
          {
            number: "1",
            title: "Primitives",
            tagline: "The boring building blocks that make everything else possible.",
            body: (
              <>
                Irreducible components like buttons, inputs, checkboxes, and
                icons. Their goals are stability, accessibility, and
                consistency. They should be as &ldquo;boring&rdquo; as
                possible.
              </>
            ),
            meta: [
              { dt: "Examples", dd: "Button, Input, Checkbox, Icon, Typography" },
              { dt: "Work of the system", dd: "Naming, tokens, accessibility patterns" },
              { dt: "Watch for", dd: "Bloated props, reinventing label or error logic" },
            ],
          },
          {
            number: "2",
            title: "Compounds",
            tagline: "Blessed combinations with baked-in conventions.",
            body: (
              <>
                Compounds bundle primitives into predictable, reusable
                groupings. They codify conventions and reduce repeated
                decision-making across teams.
              </>
            ),
            meta: [
              { dt: "Examples", dd: "TextField, Card, TableRow, Chip, Avatar" },
              { dt: "Work of the system", dd: "Defining which sub-parts exist, providing safe variations" },
              { dt: "Watch for", dd: "“Mega-props” that account for every variation" },
            ],
          },
          {
            number: "3",
            title: "Composers",
            tagline: "Orchestration of state, interaction, and context.",
            body: (
              <>
                Composers orchestrate state, focus, and behavior across
                multiple children. This is where systems meet complexity:
                modals, toolbars, message composers, pagination.
              </>
            ),
            meta: [
              { dt: "Examples", dd: "Modal, FormField, Toolbar, Pagination, Rich Text Editor" },
              { dt: "Work of the system", dd: "Governing orchestration, exposing slots, avoiding prop explosion" },
              { dt: "Watch for", dd: "Burying orchestration in ad-hoc props instead of context" },
            ],
          },
          {
            number: "4",
            title: "Assemblies",
            tagline: "Product-level flows that live outside the system.",
            body: (
              <>
                Assemblies are application-specific flows encoded as
                components. They aren&apos;t universal system primitives;
                they&apos;re product constructs that use the system&apos;s
                building blocks.
              </>
            ),
            meta: [
              { dt: "Examples", dd: "Checkout flow, Project board, Analytics dashboard" },
              { dt: "Work of the system", dd: "Provide building blocks; assemblies live at the app layer" },
              { dt: "Watch for", dd: "Accidentally “baking in” product-specific flows" },
            ],
          },
        ]}
      />

      <h2>Why composition matters</h2>
      <p>
        Design systems cannot anticipate every product problem, every variant,
        or every edge case. If they try, they either collapse under prop bloat
        (&ldquo;yet another boolean for yet another exception&rdquo;) or grind
        to a halt as every new request funnels through the system team. Both
        outcomes slow teams and erode trust.
      </p>
      <p>
        <strong>Composition is the release valve.</strong> By leaning into
        patterns like compound components, slotting, and substitution, you give
        product teams a way to use the system a la carte, insert what they
        need, omit what they don&apos;t, and stay unblocked. Because
        orchestration is handled by composers, accessibility, ARIA, and state
        management rules are inherited &ldquo;for free.&rdquo;
      </p>

      <h2>Meta-patterns across all layers</h2>
      <dl>
        <dt><strong>Slotting &amp; substitution</strong></dt>
        <dd>
          Anticipate replaceable regions (children, slots, render props). The
          system defines the shape; teams fill in the content.
        </dd>
        <dt><strong>Headless abstractions</strong></dt>
        <dd>
          Separate logic (hooks, providers) from presentation (styled
          components). This enables theming, testing, and platform-specific
          implementations without duplicating behavior.
        </dd>
        <dt><strong>Contextual orchestration</strong></dt>
        <dd>
          Treat composers as state providers, not just visual containers.
          Context APIs share state between sub-parts without prop drilling.
        </dd>
      </dl>

      <h2>Thinking in layers</h2>
      <p>
        For junior designers, the natural unit of thinking is the{" "}
        <strong>screen</strong>: what needs to be drawn to make this flow work?
        For system designers, the unit shifts to <strong>grammar</strong>: what
        are the rules of combination, and how do we prepare for emergent
        complexity?
      </p>
      <table className="props-table">
        <thead>
          <tr><th>Layer</th><th>Demand</th><th>Focus</th></tr>
        </thead>
        <tbody>
          <tr><td>Primitives</td><td>Standards</td><td>Stability, tokens, accessibility</td></tr>
          <tr><td>Compounds</td><td>Conventions</td><td>Blessed combinations, consistent spacing</td></tr>
          <tr><td>Composers</td><td>Orchestration</td><td>State management, focus, context</td></tr>
          <tr><td>Assemblies</td><td>Boundaries</td><td>Product-specific flows, business logic</td></tr>
        </tbody>
      </table>
      <p>
        When you apply this layered lens, your system stops being a library of
        parts and becomes a <strong>language for products</strong>.
      </p>

      <h2>Complexity is inevitable. Chaos is optional.</h2>
      <p>
        The goal isn&apos;t to eliminate complexity — it&apos;s to channel it
        into structures that remain legible, maintainable, and extensible:
      </p>
      <ul>
        <li>A button is stable.</li>
        <li>A field is orchestrated.</li>
        <li>A toolbar overflows gracefully.</li>
        <li>A rich text editor governs the chaos of paste and plugins.</li>
      </ul>
      <p>
        By recognizing components not as flat things, but as layered patterns,
        you prepare your system for growth. You teach teams not only{" "}
        <em>what</em> to build, but <em>how</em> to think about building — and
        that&apos;s the difference between a component library and a true
        design system.
      </p>
    </article>
  );
}

function PrimitivesPanel() {
  return (
    <article>
      <h2>Why primitives matter</h2>
      <p>
        Primitives are the ground floor of any design system. They&apos;re the
        atoms: the smallest irreducible components that represent a single
        design decision. Buttons, inputs, checkboxes, icons, typographic
        elements — each is small enough to feel trivial, but together they
        form the grammar of every interface.
      </p>
      <p>
        The paradox of primitives is that their importance is inversely
        proportional to their excitement. The most boring components — when
        standardized and consistent — enable the most creative outcomes at
        higher layers. When they&apos;re unstable or inconsistent, complexity
        compounds exponentially.
      </p>
      <p>That&apos;s why primitives must be:</p>
      <ul>
        <li>
          <strong>Stable:</strong> their APIs change rarely, because every
          downstream component depends on them.
        </li>
        <li>
          <strong>Accessible:</strong> they bake in baseline ARIA and keyboard
          support, so teams can&apos;t &ldquo;forget&rdquo; the fundamentals.
        </li>
        <li>
          <strong>Consistent:</strong> they enforce token usage and naming
          conventions that ripple through the entire system.
        </li>
      </ul>

      <h2>The work of primitives</h2>

      <h3>1. Standards and naming</h3>
      <p>
        Primitives encode standards into the system. A Button isn&apos;t just a
        clickable element — it carries naming conventions, semantic intent, and
        design tokens for states (default, hover, active, disabled).
      </p>

      <h3>2. Tokens as DNA</h3>
      <p>
        Every primitive should consume tokens, not hardcoded values. This links
        design intent directly to code and allows system-wide theming without
        rewrites.
      </p>

      <h3>3. Accessibility baselines</h3>
      <p>
        Primitives are the system&apos;s first line of accessibility defense.
        Buttons must always be focusable, keyboard-activatable, and
        screen-reader friendly. Inputs must handle labels, ARIA attributes, and
        states. Because these patterns are embedded in primitives, downstream
        teams don&apos;t have to learn them anew for every feature.
      </p>

      <h2>A properly boring Button primitive</h2>
      <CodeViewer
        filename="Button.tsx"
        code={`export interface ButtonProps {
  /** Visual weight of the button */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Optional loading spinner */
  isLoading?: boolean;
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled,
  isLoading,
  children,
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      className={\`btn btn-\${variant} btn-\${size}\`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading && <Spinner aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}`}
      />

      <h2>Why &ldquo;boring&rdquo; is strategic</h2>
      <p>
        It&apos;s tempting to make primitives expressive — throw in clever
        styles, animations, or flexible APIs. But &ldquo;boring&rdquo;
        primitives are what make them reliable. A boring button doesn&apos;t
        surprise you with odd hover logic. A boring input doesn&apos;t embed
        its own form validation rules. A boring icon doesn&apos;t ship 50
        variants of its own sizing model.
      </p>
      <p>
        By being boring, primitives are predictable. Predictability is what
        allows compounds and composers to flourish without constantly patching
        or rethinking the foundation.
      </p>

      <h2>Pitfalls of primitives</h2>

      <h3>1. Bloated props</h3>
      <p>
        A primitive is not meant to cover every use case. Overloading a Button
        with every possible prop (&ldquo;size, variant, tone, emphasis, density,
        iconPosition, isLoading, isGhost, isText, isIconOnly, shape, animation,
        elevation...&rdquo;) is a sign that you&apos;re asking a primitive to
        do compound or composer work.
      </p>
      <p>
        <strong>Guardrail:</strong> primitives should expose only intrinsic
        variations. For Button: size, variant, state.
      </p>

      <h3>2. Reinventing label/error logic</h3>
      <p>
        Inputs are especially prone to this. A TextInput primitive should not
        reinvent labels or error messaging inside itself. That&apos;s the job
        of a Field composer.
      </p>

      <h3>3. Skipping tokens</h3>
      <p>
        A primitive that uses hex codes or inline styles instead of tokens
        creates technical debt: theming, dark mode, and cross-brand parity all
        break downstream.
      </p>

      <h3>4. Over-styled primitives</h3>
      <p>
        Primitives should be boring. Introducing expressive styles (gradients,
        shadows, animations) into primitives makes them fragile. Expressiveness
        belongs in compounds, composers, or product assemblies — not in the
        atomic layer.
      </p>

      <h2>Why standards at the primitive layer matter</h2>
      <ul>
        <li>
          <strong>Ripple effects:</strong> a poorly built primitive button
          means every compound (modal footers, toolbars) inherits bad
          accessibility.
        </li>
        <li>
          <strong>Trust:</strong> if designers and engineers can&apos;t trust
          the button, they&apos;ll fork their own, and the system fragments.
        </li>
        <li>
          <strong>Economy of scale:</strong> fixes are cheapest at the
          primitive layer. One token update, thousands of instances improved.
        </li>
      </ul>
    </article>
  );
}

function CompoundsPanel() {
  return (
    <article>
      <h2>Why compounds exist</h2>
      <p>
        If primitives are the raw parts, compounds are the predictable bundles.
        They emerge when teams repeatedly combine the same primitives in the
        same ways. Instead of asking designers and developers to reinvent the
        bundle every time, the system codifies the convention.
      </p>
      <p>
        Compounds give structure to combinations that look obvious in hindsight
        but are fragile in practice:
      </p>
      <ul>
        <li>A text input always needs a label for accessibility.</li>
        <li>A table row always assumes a parent table context.</li>
        <li>A card usually pairs heading, body, and actions in a fixed layout.</li>
        <li>A chip bundles a label with an optional dismiss button.</li>
      </ul>

      <h2>Characteristics of compounds</h2>
      <ul>
        <li>
          <strong>Predictable combinations:</strong> the system declares which
          primitives belong together and how they relate.
        </li>
        <li>
          <strong>Narrow scope:</strong> compounds aren&apos;t meant to
          anticipate every possible combination — only the blessed ones that
          the system has validated.
        </li>
        <li>
          <strong>Stable defaults:</strong> compounds handle spacing, grouping,
          and visual rhythm once.
        </li>
        <li>
          <strong>Consistent behavior:</strong> accessibility rules like label
          associations, ARIA attributes, and keyboard support are guaranteed.
        </li>
        <li>
          <strong>Semantic structure:</strong> compounds often expose slots
          (Header, Body, Footer) that enforce semantic organization while
          allowing flexible content.
        </li>
      </ul>

      <h2>Canonical example: TextField compound</h2>
      <p>
        The TextField is the canonical example of a compound. It bundles an
        Input primitive with Label, HelperText, and ErrorMessage, while
        managing all the accessibility associations automatically:
      </p>
      <CodeViewer
        filename="TextField.tsx"
        code={`interface TextFieldProps {
  id?: string;
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  /* ...other passthroughs */
}

function TextField({ id: providedId, label, error, helperText, required, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const id = providedId || generatedId;

  // Build aria-describedby for proper screen reader association
  const errorId = error ? \`\${id}-error\` : undefined;
  const helperId = helperText && !error ? \`\${id}-helper\` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>

      <Input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
      />

      {helperText && !error && <p id={helperId}>{helperText}</p>}
      {error && <p id={errorId} role="alert">{error}</p>}
    </div>
  );
}`}
      />

      <h3>What makes this a good compound</h3>
      <ul>
        <li>
          <strong>Auto-generated IDs:</strong> uses <code>useId()</code> to
          ensure unique IDs without requiring consumers to manage them.
        </li>
        <li>
          <strong>ARIA associations:</strong> automatically links the input to
          its label, helper text, and error message via{" "}
          <code>aria-describedby</code>.
        </li>
        <li>
          <strong>Error announcements:</strong> error messages have{" "}
          <code>role=&quot;alert&quot;</code> so screen readers announce them
          immediately.
        </li>
        <li>
          <strong>Consistent spacing:</strong> the compound manages all
          internal spacing, ensuring visual rhythm across all instances.
        </li>
      </ul>

      <h2>The slot pattern (Card)</h2>
      <p>
        Cards demonstrate the &ldquo;slot&rdquo; pattern, where the compound
        defines semantic areas (Header, Body, Footer) while allowing flexible
        content within each slot:
      </p>
      <CodeViewer
        filename="Card.tsx"
        code={`function Card({ children, variant = 'default', padding = 'md', interactive, onClick }: CardProps) {
  // ...renders the surface, owns layout decisions
  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {children}
    </div>
  );
}

// Slot components for semantic structure
Card.Header = ({ children, action }: ...) => <div>...</div>;
Card.Title = ({ children }: ...) => <h3>{children}</h3>;
Card.Body = ({ children }: ...) => <div>{children}</div>;
Card.Footer = ({ children }: ...) => <div>{children}</div>;`}
      />

      <h2>The work of the system at the compound layer</h2>

      <h3>1. Define conventions</h3>
      <ul>
        <li>Establish what belongs together: label + input, icon + text, header + footer.</li>
        <li>Document approved variations (e.g., TextField can have optional helper text, but never hides the label).</li>
        <li>Specify the relationship between parts (e.g., error replaces helper text, not stacks with it).</li>
      </ul>

      <h3>2. Encode blessed combinations</h3>
      <ul>
        <li>Bake spacing, order, and accessibility rules directly into the compound implementation.</li>
        <li>Consumers can&apos;t accidentally break associations because they&apos;re not exposed as options.</li>
      </ul>

      <h3>3. Allow controlled flexibility</h3>
      <ul>
        <li>Compounds should allow flexibility through slots and optional props, but within defined boundaries.</li>
        <li>Prevent unbounded prop creep — flexibility should follow the system&apos;s conventions, not bypass them.</li>
      </ul>

      <h2>Pitfalls of compounds</h2>
      <ol>
        <li>
          <strong>Prop explosion.</strong> When compounds try to solve every
          variation, they mutate into composers. If you find yourself adding a
          boolean prop every sprint, you&apos;ve crossed layers.
        </li>
        <li>
          <strong>Breaking accessibility by accident.</strong> A text field
          without a proper <code>&lt;label&gt;</code> or{" "}
          <code>aria-describedby</code> is a broken compound. Accessibility
          associations must be baked in and impossible to disable.
        </li>
        <li>
          <strong>Over-abstracting visuals.</strong> A Card that allows every
          combination of header/body/footer permutations becomes ungovernable.
          Fix the expected structure, allow slots for content variation.
        </li>
        <li>
          <strong>Duplication of logic.</strong> Don&apos;t reimplement
          primitive behaviors inside compounds. Compounds compose primitives;
          they don&apos;t replace them.
        </li>
        <li>
          <strong>Leaking internal structure.</strong> Exposing too many
          internal details (specific CSS classes, DOM structure) makes
          compounds fragile to change.
        </li>
      </ol>

      <h2>Compounds vs primitives vs composers</h2>
      <ul>
        <li>
          <strong>Primitives</strong> are single-purpose, atomic components
          with no opinion about how they&apos;re used together.
        </li>
        <li>
          <strong>Compounds</strong> are blessed combinations of primitives
          with baked-in conventions. They encode &ldquo;these things always go
          together.&rdquo;
        </li>
        <li>
          <strong>Composers</strong> orchestrate state, focus, and interaction
          across multiple children. They manage complex behavior, not just
          structure.
        </li>
      </ul>
      <p>
        Rule of thumb: if you&apos;re managing state transitions, focus
        trapping, or multi-step interactions, you&apos;re in composer
        territory. If you&apos;re bundling parts that always appear together
        with consistent styling, you&apos;re in compound territory.
      </p>
    </article>
  );
}

function ComposersPanel() {
  return (
    <article>
      <h2>Why composers exist</h2>
      <p>
        Primitives give us atoms, compounds give us molecules — but product
        interfaces demand more. A composer is where a design system stops
        bundling parts and starts orchestrating interaction and state.
      </p>
      <p>
        Think of a modal, a toolbar, pagination, or a form fieldset. These
        aren&apos;t just bundles of primitives — they coordinate multiple
        states (open/closed, selected/unselected), multiple flows (keyboard vs
        mouse, small vs large screen), and multiple roles (what happens to
        focus, what gets announced to a screen reader, what rules apply when
        contents vary). Composers exist because user interactions don&apos;t
        stop at a single element — they span across elements.
      </p>

      <h2>Characteristics of composers</h2>
      <ul>
        <li>
          <strong>Orchestration:</strong> manage focus, context, and state for
          child primitives/compounds.
        </li>
        <li>
          <strong>Slotting:</strong> expose defined areas (header, body,
          footer, actions) for flexible composition.
        </li>
        <li>
          <strong>Variation by pattern, not prop:</strong> handle families of
          behavior (e.g. ellipses in pagination) rather than a Boolean soup of
          configuration.
        </li>
        <li>
          <strong>Context providers:</strong> share state between sub-parts
          without forcing prop-drilling.
        </li>
      </ul>

      <h2>A Modal composer</h2>
      <p>
        Below is a minimal Modal composer. The composer owns escape-key
        handling, overlay click-to-close, and stopPropagation on the inner
        content. Slots expose Header / Body / Footer regions for product use:
      </p>
      <CodeViewer
        filename="Modal.tsx"
        code={`export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  // Escape key handling lives in the composer, not in each consumer
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}                                /* overlay click closes */
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}           /* content click does not */
      >
        {children}
      </div>
    </div>
  );
}

Modal.Header = ({ children }) => <div className="modal-header">{children}</div>;
Modal.Body   = ({ children }) => <div className="modal-body">{children}</div>;
Modal.Footer = ({ children }) => <div className="modal-footer">{children}</div>;`}
      />

      <h2>Context-based composer: FormField</h2>
      <p>
        A more complex composer demonstrates context-based orchestration. The
        FormField owns id generation, error state, and the{" "}
        <code>aria-describedby</code> wiring. Children (
        <code>FormField.Label</code>, <code>FormField.Input</code>,{" "}
        <code>FormField.Error</code>) read from context, so there&apos;s no
        prop drilling:
      </p>
      <CodeViewer
        filename="FormField.tsx"
        code={`const FieldContext = createContext<FieldContextValue | null>(null);

export function useField() {
  const context = useContext(FieldContext);
  if (!context) throw new Error('useField must be used within a FormField');
  return context;
}

export function FormField({ children, required, disabled, validator }: FormFieldProps) {
  const id = useId();
  const [error, setError] = useState<string>();

  const describedBy = [
    error ? \`\${id}-error\` : null,
    \`\${id}-helper\`,
  ].filter(Boolean).join(' ');

  return (
    <FieldContext.Provider
      value={{ id, error, required, disabled, describedBy, setError, validate }}
    >
      <div>{children}</div>
    </FieldContext.Provider>
  );
}

FormField.Label = ({ children }) => {
  const { id, required, error } = useField();
  return <label htmlFor={id}>{children}{required && <span aria-hidden>*</span>}</label>;
};

FormField.Input = (props) => {
  const { id, error, disabled, describedBy } = useField();
  return (
    <Input
      {...props}
      id={id}
      disabled={disabled}
      aria-describedby={describedBy}
      aria-invalid={!!error}
    />
  );
};

FormField.Error = () => {
  const { id, error } = useField();
  if (!error) return null;
  return <p id={\`\${id}-error\`} role="alert">{error}</p>;
};`}
      />

      <h2>The work of the system at the composer layer</h2>

      <h3>1. Orchestration</h3>
      <ul>
        <li>Control state transitions (modal open → trap focus → restore focus on close).</li>
        <li>Govern keyboard interaction models (arrow keys in toolbars, tab order in forms).</li>
        <li>Provide context for sub-parts (form state, toolbar action registry).</li>
      </ul>

      <h3>2. Variation by pattern</h3>
      <ul>
        <li>Instead of adding a prop for every variant, encode structural patterns.</li>
        <li>
          Example: pagination doesn&apos;t expose <code>showEllipses: boolean</code>;
          it defines a policy for when ellipses appear.
        </li>
      </ul>

      <h3>3. Slots for composition</h3>
      <ul>
        <li>Provide places for product-specific content without breaking orchestration.</li>
        <li>
          Example: Modal slots for header/body/footer let teams add what they
          need while the system enforces a11y and focus rules.
        </li>
      </ul>

      <h2>Pitfalls of composers</h2>
      <ol>
        <li>
          <strong>Prop explosion as a lazy shortcut.</strong> Composers often
          start with props for each variation:{" "}
          <code>hasCloseButton, showFooter, isInline, isSticky</code>. Encode
          variations as structural patterns, not toggles.
        </li>
        <li>
          <strong>Leaking internal state.</strong> If a form composer exposes
          internal validation state poorly, teams hack around it. Provide a
          clean context/hook API for internal orchestration.
        </li>
        <li>
          <strong>Breaking accessibility in the orchestration.</strong> A modal
          that doesn&apos;t trap focus or a toolbar without roving tabindex.
          Accessibility rules must be first-class orchestration, not optional
          add-ons.
        </li>
        <li>
          <strong>Overgeneralization.</strong> A &ldquo;SuperModal&rdquo; that
          tries to handle every drawer/alert/dialog variant will be brittle.
          Scope composers to a pattern family, not the entire design problem
          space.
        </li>
      </ol>

      <h2>Why composers are critical</h2>
      <ul>
        <li>
          <strong>Single source of truth.</strong> Complex behavior lives in
          one place, not scattered across implementations. When focus
          management needs to change, you update the composer — not dozens of
          components.
        </li>
        <li>
          <strong>Consistent patterns.</strong> Every modal, form field, or
          toolbar behaves identically. Users build muscle memory; developers
          build confidence.
        </li>
        <li>
          <strong>Accessibility by default.</strong> ARIA relationships, focus
          management, and keyboard behavior are built-in.
        </li>
        <li>
          <strong>Easier testing.</strong> Test the composer once, trust it
          everywhere. Integration tests can focus on business logic rather
          than re-verifying focus trapping.
        </li>
      </ul>
    </article>
  );
}

function AssembliesPanel() {
  return (
    <article>
      <h2>Why assemblies exist</h2>
      <p>
        Assemblies are the final layer — application-specific flows encoded as
        components. They aren&apos;t universal system primitives; they&apos;re
        product constructs that <em>use</em> the system&apos;s building
        blocks. A checkout flow, a project board, an analytics dashboard, a
        device-setup wizard — these are assemblies.
      </p>
      <p>
        The most important property of an assembly is that it lives{" "}
        <strong>outside the design system</strong>. The system provides the
        primitives, compounds, and composers; the application assembles them
        into the flows that solve its specific product problems.
      </p>

      <h2>Characteristics of assemblies</h2>
      <ul>
        <li>
          <strong>Domain-shaped:</strong> assemblies have product
          vocabulary — &ldquo;cart&rdquo;, &ldquo;shipping address&rdquo;,
          &ldquo;promo code&rdquo; — not generic UI vocabulary.
        </li>
        <li>
          <strong>Business-logic-aware:</strong> they own the rules of the
          flow, the validation, the calls to the API, and the orchestration
          across steps.
        </li>
        <li>
          <strong>Composed from system parts:</strong> the visual surface is
          almost entirely TextField, Card, RadioGroup, Modal, etc. — system
          composers and compounds. The assembly itself is the glue.
        </li>
        <li>
          <strong>Owned by the product team:</strong> not by the design system
          team. The system team provides building blocks; the application
          composes assemblies on top.
        </li>
      </ul>

      <h2>Sketch of a Checkout assembly</h2>
      <p>
        A checkout assembly owns the flow state machine (cart → shipping →
        payment → review → confirmation) and uses system parts to render each
        step. The state lives in an assembly-level context; each step is a
        small composition of compounds and composers:
      </p>
      <CodeViewer
        filename="Checkout.tsx"
        code={`// Assembly-level state — product domain, not generic UI
interface CheckoutState {
  step: 'cart' | 'shipping' | 'payment' | 'review' | 'confirmation';
  cart: CartItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  promoCode: PromoCode | null;
  acceptedTerms: boolean;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CheckoutState>(initialState);

  // Derived totals — business logic owned by the assembly
  const subtotal = useMemo(() => /* sum cart items */, [state.cart]);
  const tax      = useMemo(() => /* 8.25% on subtotal-discount+shipping */, [subtotal, ...]);
  const total    = useMemo(() => /* subtotal-discount+shipping+tax */, [subtotal, ...]);

  return <CheckoutContext.Provider value={{ state, subtotal, tax, total, /* ...actions */ }}>{children}</CheckoutContext.Provider>;
}

function CheckoutFlow() {
  const { state } = useCheckout();
  return (
    <>
      <ProgressIndicator currentStep={state.step} />
      {state.step === 'cart'         && <CartStep />}
      {state.step === 'shipping'     && <ShippingStep />}
      {state.step === 'payment'      && <PaymentStep />}
      {state.step === 'review'       && <ReviewStep />}
      {state.step === 'confirmation' && <ConfirmationStep />}
    </>
  );
}

// Each step is glue — small composition of system parts
function ShippingStep() {
  const { state, updateShippingAddress, goToStep } = useCheckout();
  const { errors, validateAll, touchField } = useFormValidation(SHIPPING_RULES);
  return (
    <Card variant="elevated" title="Contact Information">
      <TextField label="First name" required value={state.shippingAddress.firstName}
                 onChange={e => updateShippingAddress('firstName', e.target.value)}
                 onBlur={() => touchField('firstName')} error={errors.firstName} />
      <TextField label="Email" type="email" required ... />
      <RadioGroup legend="Shipping method" options={SHIPPING_METHODS} ... />
      <Button onClick={() => validateAll(state.shippingAddress) && goToStep('payment')}>
        Continue to payment
      </Button>
    </Card>
  );
}`}
      />

      <h2>The work at the assembly layer</h2>

      <h3>1. Owning the flow</h3>
      <p>
        Assemblies own the state machine, the step sequencing, the
        cross-cutting validation rules, and the integration with backend
        services. They&apos;re the layer where &ldquo;press the back button to
        edit shipping&rdquo; gets implemented, not the layer where the button
        is drawn.
      </p>

      <h3>2. Composing — never reinventing — system parts</h3>
      <p>
        If you find yourself reaching into an assembly and re-styling a button
        or rewriting a TextField, you&apos;re crossing layers. The right move
        is either to add the missing variation to the system (if it&apos;s
        broadly useful) or to leave the assembly composed of unmodified system
        parts.
      </p>

      <h3>3. Encoding product policy</h3>
      <p>
        Assembly code is where product-specific rules live: how to compute
        tax, how to apply a promo code, what happens if a payment fails, what
        the confirmation email looks like. These rules don&apos;t belong in
        the system; the system team would be wrong to own them.
      </p>

      <h2>Pitfalls of assemblies</h2>
      <ol>
        <li>
          <strong>Pushing product policy into the system.</strong> The most
          common failure mode. A team needs a &ldquo;CheckoutButton&rdquo;
          variant in the system. Instead, expose a generic Button and let the
          assembly own its checkout-specific label, analytics, and side effect.
        </li>
        <li>
          <strong>Forking system components inside assemblies.</strong> If a
          system part is wrong, fix it in the system or surface a structural
          gap — don&apos;t maintain a divergent copy under the assembly.
        </li>
        <li>
          <strong>Treating every product as an assembly.</strong> If a layout
          appears in three products, it might be a composer or compound rather
          than an assembly. The assembly bar is product-specific
          flow, not just &ldquo;a complex screen.&rdquo;
        </li>
        <li>
          <strong>Hiding the state machine.</strong> Assemblies that bury their
          step sequencing in deeply nested useEffects become impossible to
          reason about. Make the state machine explicit — even a tagged union
          like <code>{`step: 'cart' | 'shipping' | ...`}</code> beats hidden
          control flow.
        </li>
      </ol>

      <h2>Where assemblies sit</h2>
      <p>
        If primitives are the boring DNA, compounds are the grammar rules, and
        composers are the syntax — assemblies are the <em>sentences</em>.
        They&apos;re what a product actually says with the language the design
        system provides. The system&apos;s job is to make those sentences easy
        to write, easy to read, and easy to change.
      </p>
    </article>
  );
}

interface LayerCardMeta {
  dt: string;
  dd: string;
}

interface LayerCardSpec {
  number: string;
  title: string;
  tagline: string;
  body: React.ReactNode;
  meta: LayerCardMeta[];
}

function LayerGrid({ layers }: { layers: LayerCardSpec[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "var(--space-5)",
        margin: "var(--space-5) 0",
      }}
    >
      {layers.map((layer) => (
        <div key={layer.title} className="card card--inset">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              marginBottom: "var(--space-3)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 999,
                background: "var(--bg-surface-2, var(--bg-surface))",
                border: "1px solid var(--border-default)",
                fontSize: "var(--fs-200)",
                fontWeight: 600,
              }}
            >
              {layer.number}
            </span>
            <strong style={{ fontSize: "var(--fs-400)" }}>{layer.title}</strong>
          </div>
          <p
            className="muted"
            style={{
              marginTop: 0,
              marginBottom: "var(--space-3)",
              fontSize: "var(--fs-200)",
            }}
          >
            {layer.tagline}
          </p>
          <p style={{ marginTop: 0, marginBottom: "var(--space-4)" }}>
            {layer.body}
          </p>
          <dl style={{ margin: 0 }}>
            {layer.meta.map((m) => (
              <div
                key={m.dt}
                style={{ marginBottom: "var(--space-2)", fontSize: "var(--fs-200)" }}
              >
                <dt style={{ fontWeight: 600, display: "inline" }}>{m.dt}: </dt>
                <dd style={{ display: "inline", margin: 0, color: "var(--fg-muted)" }}>
                  {m.dd}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
