import { Tabs, TabsList, TabsTab } from "@full-stack-ds/react";
import { buildHref, type TokensTab } from "../router";
import { CodeViewer } from "../components/CodeViewer";

interface TokensPhilosophyViewProps {
  tab: TokensTab;
}

const TABS: { value: TokensTab; label: string }[] = [
  { value: "overview", label: "Philosophy" },
  { value: "core-vs-semantic", label: "Core vs semantic" },
  { value: "token-naming", label: "Naming" },
  { value: "theming", label: "Multi-brand theming" },
  { value: "dtcg-formats", label: "DTCG formats" },
  { value: "resolver-module", label: "Resolver" },
  { value: "schema-validation", label: "Schema & validation" },
  { value: "build-outputs", label: "Build outputs" },
  { value: "accessibility", label: "Accessibility" },
];

function handleTabChange(next: string) {
  const tab = next as TokensTab;
  window.location.hash = buildHref({ kind: "tokens-philosophy", tab }).slice(1);
}

export function TokensPhilosophyView({ tab }: TokensPhilosophyViewProps) {
  return (
    <div className="page">
      <p className="page-eyebrow">Foundations · Tokens</p>
      <h1 className="page-title">Design tokens philosophy</h1>
      <p className="page-lede">
        A two-tier architecture that separates &ldquo;what values exist&rdquo;
        from &ldquo;how values are used&rdquo; — enabling scalable theming and
        consistent design decisions without rewriting components.
      </p>

      <Tabs
        appearance="pills"
        value={tab}
        onValueChange={handleTabChange}
        aria-label="Tokens topic"
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
        {tab === "core-vs-semantic" && <CoreVsSemanticPanel />}
        {tab === "token-naming" && <TokenNamingPanel />}
        {tab === "theming" && <ThemingPanel />}
        {tab === "dtcg-formats" && <DtcgFormatsPanel />}
        {tab === "resolver-module" && <ResolverModulePanel />}
        {tab === "schema-validation" && <SchemaValidationPanel />}
        {tab === "build-outputs" && <BuildOutputsPanel />}
        {tab === "accessibility" && <A11yTokensPanel />}
      </div>
    </div>
  );
}

function OverviewPanel() {
  return (
    <article>
      <h2>The core philosophy: separation of concerns</h2>
      <p>
        Our token system is built on a fundamental principle:{" "}
        <strong>separate raw values from their semantic purpose</strong>. This
        isn&apos;t just organizational tidiness — it&apos;s a governance
        strategy that enables theming, brand switching, and systematic evolution
        without breaking components.
      </p>
      <p>
        When a designer specifies <code>semantic.color.foreground.primary</code>
        , they aren&apos;t picking a hex value. They&apos;re invoking a decision
        about hierarchy, contrast, and brand expression that has already been
        vetted. The token can be remapped to a different palette entry or tuned
        for light and dark modes, but its role and intent remain constant.
      </p>

      <h2>The three layers</h2>
      <p>
        Each layer represents a different level of abstraction, stability, and
        audience. Understanding where a token belongs helps teams make better
        decisions about naming, ownership, and extensibility.
      </p>
      <LayerGrid
        layers={[
          {
            number: "1",
            title: "Core tokens",
            tagline: "Raw values with no inherent meaning.",
            body: (
              <>
                The <strong>core layer</strong> defines primitives — the
                building blocks. Color palettes, spacing scales, typography
                ramps, motion durations. These are intentionally meaningless in
                terms of UI purpose:{" "}
                <code>core.color.palette.neutral.600</code> is just a gray —
                it doesn&apos;t say &ldquo;use me for text&rdquo; or &ldquo;use
                me for borders.&rdquo;
              </>
            ),
            meta: [
              { dt: "Examples", dd: "core.color.palette.blue.500, core.spacing.size.04" },
              { dt: "Stability", dd: "Rarely changes; the physics of the system" },
              { dt: "Audience", dd: "System maintainers, token authors" },
            ],
          },
          {
            number: "2",
            title: "Semantic tokens",
            tagline: "Purpose and meaning assigned to primitives.",
            body: (
              <>
                The <strong>semantic layer</strong> assigns roles by referencing
                core tokens. This is the theming surface — where brands diverge,
                accessibility constraints are enforced, and most designers
                interact with the system.
              </>
            ),
            meta: [
              { dt: "Examples", dd: "semantic.color.foreground.primary, semantic.color.background.danger" },
              { dt: "Stability", dd: "Names stable; values change per theme/brand" },
              { dt: "Audience", dd: "Product designers, component authors" },
            ],
          },
          {
            number: "3",
            title: "Component tokens",
            tagline: "UI-specific composition of semantic roles.",
            body: (
              <>
                The <strong>component layer</strong> applies tokens to
                anatomy — button backgrounds, card shadows, input borders.
                These alias back to semantic roles but give component teams a
                stable handle for customization.
              </>
            ),
            meta: [
              { dt: "Examples", dd: "semantic.components.button.primary.background" },
              { dt: "Stability", dd: "Tied to component API; evolves with components" },
              { dt: "Audience", dd: "Component developers, consumers" },
            ],
          },
        ]}
      />

      <h2>Mode-aware tokens via extensions</h2>
      <p>
        Rather than duplicating token files for light/dark themes, we use{" "}
        <code>$extensions.design.paths</code> to encode both variants in a
        single definition:
      </p>
      <CodeBlock
        code={`{
  "foreground": {
    "primary": {
      "$type": "color",
      "$value": "{core.color.mode.dark}",
      "$extensions": {
        "design.paths.light": "{core.color.mode.dark}",
        "design.paths.dark": "{core.color.mode.light}"
      }
    }
  }
}`}
        filename="semantic/color.tokens.json"
      />

      <h2>The reference chain</h2>
      <p>
        Tokens form a directed graph where each layer can reference tokens from
        the same or lower layers. The depth you choose determines how changes
        cascade:
      </p>
      <table className="props-table">
        <thead>
          <tr>
            <th>Layer</th>
            <th>Contains</th>
            <th>Can reference</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Core</td>
            <td>Raw values only</td>
            <td>Nothing (leaf nodes)</td>
          </tr>
          <tr>
            <td>Semantic</td>
            <td>Aliases with purpose</td>
            <td>Core or other semantic tokens</td>
          </tr>
          <tr>
            <td>Component</td>
            <td>UI-specific bindings</td>
            <td>Semantic or core tokens</td>
          </tr>
        </tbody>
      </table>

      <h2>The golden rule</h2>
      <div className="card card--inset">
        <strong>Never use raw values in components.</strong> Always reference
        tokens so the entire system can be re-themed by changing a single
        source file. This isn&apos;t just about efficiency — it&apos;s a
        structural guarantee of consistency.
      </div>
    </article>
  );
}

function CoreVsSemanticPanel() {
  return (
    <article>
      <h2>The stable contract</h2>
      <p>
        Design tokens should be a stable contract between the design layer and
        the structure layer in a design system. When a system inevitably goes
        through a rebrand, we want the surface layer to be quick to adopt and
        change, while maintenance of those changes requires minimal effort.
      </p>
      <p>
        We achieve this through layered abstraction — encoding design decisions
        into the structure of our components while offering small escape
        hatches for maintainers. The question isn&apos;t whether to use layers,
        but <strong>at what depth do you want to make changes?</strong>
      </p>

      <h2>The tree model of abstraction</h2>
      <CodeBlock
        code={`Depth 0: Raw Value     →  #fafafa
    ↓
Depth 1: Primitive     →  neutral-100
    ↓
Depth 2: Semantic      →  surface-primary
    ↓
Depth 3: Component     →  card-background-default
    ↓
Depth 4+: Variant      →  card-background-hover`}
      />
      <p>
        If you have a change that affects many items, would you rather chase
        down 700+ uses of the same value at the component level, or change one
        value further up the tree and let it cascade down?
      </p>

      <h3>Depth trade-offs</h3>
      <table className="props-table">
        <thead>
          <tr>
            <th>Depth</th>
            <th>Abstraction level</th>
            <th>Change impact</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>0</td><td>Raw value</td><td>Changes everything using that value</td></tr>
          <tr><td>1</td><td>Primitive</td><td>Changes all semantics referencing it</td></tr>
          <tr><td>2</td><td>Semantic</td><td>Changes all components using that role</td></tr>
          <tr><td>3</td><td>Component</td><td>Changes one component&apos;s appearance</td></tr>
          <tr><td>4+</td><td>Variant/state</td><td>Changes one specific state</td></tr>
        </tbody>
      </table>

      <h2>Semantic tokens can reference other semantics</h2>
      <p>
        A key insight: semantic tokens aren&apos;t limited to referencing only
        core tokens. They can reference other semantic tokens when it makes
        sense for the abstraction.
      </p>
      <CodeBlock
        code={`// Semantic referencing core (base role)
{
  "status": {
    "danger": {
      "$type": "color",
      "$value": "{core.color.palette.red.500}"
    }
  }
}

// Semantic referencing semantic (derived role)
{
  "components": {
    "button": {
      "danger": {
        "background": { "$value": "{semantic.color.status.danger}" }
      }
    },
    "alert": {
      "danger": {
        "border": { "$value": "{semantic.color.status.danger}" }
      }
    }
  }
}`}
      />
      <p>
        Now if you change <code>status.danger</code>, both the button and alert
        update together. This is the power of choosing the right depth of
        abstraction.
      </p>

      <h2>Pitfalls to avoid</h2>
      <h3>1. Raw values in semantic tokens</h3>
      <p>
        Semantic tokens should <strong>never</strong> contain raw values. This
        breaks the reference chain and prevents systematic updates.
      </p>
      <CodeBlock
        code={`// BAD: Raw value in semantic token
{ "foreground": { "primary": { "$value": "#141414" } } }

// GOOD: Reference to core token
{ "foreground": { "primary": { "$value": "{core.color.mode.dark}" } } }`}
      />

      <h3>2. Circular references</h3>
      <p>
        While semantic-to-semantic references are valid, they cannot form
        cycles. The validator catches these at build time.
      </p>

      <h3>3. Using core tokens directly in components</h3>
      <p>
        Components should use semantic tokens, not core tokens. This ensures
        theming works correctly and design decisions stay centralized.
      </p>

      <h3>4. Wrong depth of abstraction</h3>
      <p>
        Choose the depth that matches how you expect changes to cascade. Too
        shallow means more manual updates; too deep means less flexibility.
      </p>
    </article>
  );
}

function TokenNamingPanel() {
  return (
    <article>
      <h2>Why naming matters</h2>
      <p>
        Token names are API design. They&apos;re the interface between design
        decisions and implementation — the contract that designers, developers,
        and tooling all depend on. Unlike code variables that can be refactored
        with IDE tooling, token names propagate across design tools,
        documentation, CSS output, and TypeScript types. Renaming a token is a
        breaking change that ripples through the entire system.
      </p>

      <h2>The naming formula</h2>
      <CodeBlock
        code={`[layer].[category].[subcategory].[variant].[state]

Examples:
core.color.palette.neutral.600
semantic.color.foreground.primary
semantic.components.button.primary.background
semantic.spacing.gap.grid`}
      />

      <h3>Layer prefix (required)</h3>
      <table className="props-table">
        <thead>
          <tr><th>Prefix</th><th>Purpose</th><th>Can reference</th></tr>
        </thead>
        <tbody>
          <tr><td><code>core.</code></td><td>Raw primitives with no semantic meaning</td><td>Nothing (leaf nodes)</td></tr>
          <tr><td><code>semantic.</code></td><td>Purpose-driven roles and aliases</td><td><code>core.*</code> or other <code>semantic.*</code></td></tr>
          <tr><td><code>semantic.components.</code></td><td>UI-specific bindings</td><td><code>semantic.*</code> or <code>core.*</code></td></tr>
        </tbody>
      </table>

      <h2>Naming principles</h2>

      <h3>1. Describe purpose, not implementation</h3>
      <CodeBlock
        code={`// BAD: Describes implementation
semantic.color.blue500
semantic.color.grayText
semantic.spacing.16px

// GOOD: Describes purpose
semantic.color.foreground.link
semantic.color.foreground.secondary
semantic.spacing.gap.grid`}
      />

      <h3>2. Use nouns for tokens, verbs for utilities</h3>
      <p>
        Tokens represent values (nouns). Utilities and functions represent
        actions (verbs). This distinction keeps the mental model clear.
      </p>

      <h3>3. Maintain consistent depth</h3>
      <p>
        Tokens at the same conceptual level should have the same depth. Avoid
        skipping hierarchy levels or creating inconsistent structures.
      </p>

      <h3>4. Prefer explicit over abbreviated</h3>
      <p>
        Clarity beats brevity. Abbreviated names save a few characters but cost
        discoverability.{" "}
        <code>semantic.color.foreground.primary</code> beats{" "}
        <code>semantic.clr.fg.prim</code>.
      </p>

      <h2>Pitfalls to avoid</h2>
      <ul>
        <li><strong>Color names in semantic tokens</strong> — couples the name to a specific implementation</li>
        <li><strong>Size values in names</strong> — embeds specific values that may change</li>
        <li><strong>Inconsistent pluralization</strong> — be consistent with singular vs plural</li>
        <li><strong>Overloaded names</strong> — each token should have one clear purpose</li>
        <li><strong>Skipping hierarchy levels</strong> — creates inconsistent paths and breaks tooling</li>
      </ul>
    </article>
  );
}

function ThemingPanel() {
  return (
    <article>
      <h2>The theming model</h2>
      <p>
        Multi-brand theming works through three layers. Core tokens define raw
        primitives (palettes, scales). Semantic tokens give those primitives
        meaning (accent, background, border). Brand tokens remap semantic
        values to different core primitives.
      </p>

      <CodeBlock
        code={`Semantic Token                       Default (red)         Corporate (blue)
─────────────────                    ─────────────         ────────────────
--semantic-color-foreground-accent   → palette.red.500     → palette.blue.500
--semantic-color-background-accent   → palette.red.500     → palette.blue.500
--semantic-color-border-accent       → palette.red.500     → palette.blue.500
--semantic-shape-control-radius      → shape.radius.04     → shape.radius.02
--semantic-spacing-component-padding → spacing.size.05     → spacing.size.04
--semantic-motion-interaction-dur.   → motion.dur.short    → motion.dur.short2

Components always reference --semantic-* tokens.
Brand files remap which core primitives those tokens resolve to.`}
      />

      <h2>What changes per brand</h2>
      <p>Each brand can customize six categories of tokens:</p>
      <ul>
        <li><strong>Color</strong> — primary accent, link colors, highlights, action states</li>
        <li><strong>Shape</strong> — border radius (none, sharp, medium, rounded, pill), card borders, elevation</li>
        <li><strong>Spacing</strong> — component padding, gaps, card spacing</li>
        <li><strong>Motion</strong> — transition duration and easing curves</li>
        <li><strong>Typography</strong> — font weights for body and headings</li>
        <li><strong>Density</strong> — spacing scale multipliers (tight, compact, default, spacious)</li>
      </ul>

      <h3>Brand token structure</h3>
      <p>
        Each brand token file references core primitives using the DTCG token
        reference syntax. The <code>$extensions</code> object provides separate
        light and dark values for color tokens, enabling per-brand dark mode
        adjustments:
      </p>
      <CodeBlock
        filename="brands/corporate.tokens.json"
        code={`{
  "$brand": {
    "name": "corporate",
    "description": "Professional corporate brand with blue accents",
    "accent": "blue",
    "density": "compact"
  },
  "color": {
    "foreground": {
      "accent": {
        "$type": "color",
        "$value": "{color.palette.blue.500}",
        "$extensions": {
          "design.paths.light": "{color.palette.blue.500}",
          "design.paths.dark": "{color.palette.blue.400}"
        }
      }
    }
  },
  "shape": {
    "control": {
      "radius": {
        "default": { "$value": "{shape.radius.01}" }
      }
    }
  },
  "spacing": {
    "component": {
      "padding": { "$value": "{spacing.size.04}" },
      "gap": { "$value": "{spacing.size.03}" }
    }
  },
  "motion": {
    "interaction": {
      "duration": { "$value": "{motion.duration.short2}" }
    }
  }
}`}
      />

      <h2>CSS output with cascade layers</h2>
      <p>
        The build system generates CSS with cascade layers. Each layer has
        increasing precedence — brand overrides always win over theme defaults,
        and theme defaults win over semantic defaults:
      </p>
      <CodeBlock
        code={`@layer core, semantic, theme, brand, density;

@layer theme {
  .light {
    --semantic-color-foreground-accent: #d9292b;
    --semantic-color-background-primary: #ffffff;
  }
  .dark { /* dark mode overrides */ }

  @media (prefers-color-scheme: dark) {
    :root { /* system dark mode */ }
    .light { /* manual light override when system prefers dark */ }
  }
}

@layer brand {
  [data-brand="corporate"] {
    --semantic-color-foreground-accent: var(--core-color-palette-blue-500);
    --semantic-color-background-accent: var(--core-color-palette-blue-500);
    --semantic-shape-control-radius-default: var(--core-shape-radius-01);
    --semantic-spacing-component-padding: var(--core-spacing-size-04);
    --semantic-motion-interaction-duration: var(--core-motion-duration-short2);
  }

  @media (prefers-color-scheme: dark) {
    [data-brand="corporate"] {
      --semantic-color-foreground-accent: var(--core-color-palette-blue-400);
    }
  }
}

@layer density {
  [data-density="compact"] {
    --semantic-spacing-padding-container: var(--semantic-spacing-density-compact-lg);
    --semantic-spacing-padding-card: var(--semantic-spacing-density-compact-sm);
    --semantic-spacing-gap-grid: var(--semantic-spacing-density-compact-sm);
  }
}`}
      />

      <h2>Runtime brand switching</h2>
      <p>
        Brand and density switching at runtime is handled by updating data
        attributes on the document element. A small context provider manages
        state and persistence:
      </p>
      <CodeBlock
        code={`type BrandId = 'default' | 'corporate' | 'forest' | 'sunset' |
               'midnight' | 'ocean' | 'canary' | 'monochrome' |
               'rose' | 'slate';

type DensityId = 'tight' | 'compact' | 'default' | 'spacious';

function setBrand(brand: BrandId) {
  document.documentElement.setAttribute('data-brand', brand);
  localStorage.setItem('brand', brand);
}

function setDensity(density: DensityId) {
  document.documentElement.setAttribute('data-density', density);
  localStorage.setItem('density', density);
}

setBrand('corporate');
setDensity('compact');`}
      />

      <h2>Core layer: brand-agnostic primitives</h2>
      <p>
        The core layer contains primitives that all brands share. These are
        the raw materials — color palettes, spacing scales, typography ramps —
        that brands draw from. No brand defines its own palette; each one
        references values from this shared set.
      </p>

      <h2>Pitfalls to avoid</h2>
      <h3>1. Duplicating core tokens per brand</h3>
      <CodeBlock
        code={`// BAD: Brand defines its own primitives
{ "blue": { "500": { "$value": "#0a65fe" } } }

// GOOD: Brand references core primitives
{ "background": { "brand": { "$value": "{core.color.palette.blue.500}" } } }`}
      />

      <h3>2. Inconsistent semantic structure</h3>
      <p>
        All brands must use the same semantic token structure. Components
        reference semantic paths, so those paths must exist in every brand.
      </p>

      <h3>3. Hardcoding brand logic in components</h3>
      <CodeBlock
        code={`// BAD: Brand logic in component
.button { background: var(--brand-a-blue); }

// GOOD: Brand-agnostic component
.button { background: var(--semantic-color-background-accent); }`}
      />

      <h3>4. Forgetting accessibility across brands</h3>
      <p>
        Each brand&apos;s semantic tokens must maintain accessibility
        requirements. A brand can&apos;t choose colors that fail contrast
        ratios.
      </p>
    </article>
  );
}

function DtcgFormatsPanel() {
  return (
    <article>
      <h2>Why follow DTCG?</h2>
      <p>
        The <strong>W3C Design Tokens Community Group (DTCG) 1.0 specification</strong>{" "}
        defines a standard format for design tokens that enables
        interoperability between tools, platforms, and organizations. More
        importantly, DTCG mandates structured object formats instead of simple
        strings, enabling type safety and platform flexibility that
        wouldn&apos;t be possible with primitive string values.
      </p>

      <h2>Token anatomy</h2>
      <CodeBlock
        code={`{
  "tokenName": {
    "$type": "color",                    // Required: token type
    "$value": "#0a65fe",                 // Required: token value
    "$description": "Primary brand blue", // Optional: documentation
    "$extensions": {                     // Optional: custom metadata
      "design.paths.dark": "#4d9fff"
    }
  }
}`}
      />

      <h2>DTCG type system</h2>
      <table className="props-table">
        <thead>
          <tr><th>Type</th><th>Value format</th><th>Example</th></tr>
        </thead>
        <tbody>
          <tr><td><code>color</code></td><td>Hex or color object</td><td><code>&quot;#0a65fe&quot;</code></td></tr>
          <tr><td><code>dimension</code></td><td>Number with unit (px, rem)</td><td><code>&quot;16px&quot;</code></td></tr>
          <tr><td><code>number</code></td><td>Unitless number</td><td><code>1.5</code></td></tr>
          <tr><td><code>duration</code></td><td>Time with unit (ms, s)</td><td><code>&quot;250ms&quot;</code></td></tr>
          <tr><td><code>cubicBezier</code></td><td>Array of 4 numbers</td><td><code>[0.4, 0, 0.2, 1]</code></td></tr>
          <tr><td><code>fontFamily</code></td><td>String or array</td><td><code>&quot;Inter, sans-serif&quot;</code></td></tr>
          <tr><td><code>typography</code></td><td>Composite object</td><td>see below</td></tr>
          <tr><td><code>shadow</code></td><td>Composite object</td><td>see below</td></tr>
        </tbody>
      </table>

      <h2>Composite tokens</h2>
      <p>
        Complex tokens like typography and shadows combine multiple values into
        a single token.
      </p>
      <CodeBlock
        code={`{
  "$type": "typography",
  "$value": {
    "fontFamily": "{core.typography.family.inter}",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": 1.5,
    "letterSpacing": "0em"
  }
}`}
      />

      <h2>Token references</h2>
      <p>
        Tokens can reference other tokens using the{" "}
        <code>{"{token.path}"}</code> syntax. References are resolved at build
        time. The build system follows the reference chain and substitutes the
        final value.
      </p>

      <h2>Extensions for advanced features</h2>
      <p>
        The <code>$extensions</code> property provides custom metadata for
        features beyond the DTCG spec. We use it for theming and calculations.
      </p>
      <CodeBlock
        code={`{
  "$type": "color",
  "$value": "{core.color.palette.neutral.600}",
  "$extensions": {
    "design.paths.light": "{core.color.palette.neutral.600}",
    "design.paths.dark": "{core.color.palette.neutral.300}"
  }
}`}
      />

      <h2>Pitfalls to avoid</h2>
      <ul>
        <li><strong>Wrong type for value</strong> — <code>$type</code> must match <code>$value</code> format</li>
        <li><strong>Missing units on dimensions</strong> — dimensions require units (except zero)</li>
        <li><strong>Invalid unit types</strong> — DTCG 1.0 only allows <code>px</code> and <code>rem</code></li>
        <li><strong>Circular references</strong> — references cannot form cycles</li>
        <li><strong>Typos in reference paths</strong> — references must point to tokens that exist</li>
      </ul>
    </article>
  );
}

function ResolverModulePanel() {
  return (
    <article>
      <h2>Why a resolver module?</h2>
      <p>
        Simple token systems resolve references by direct substitution. But
        real-world systems need more: brand switching, theme variants,
        platform-specific values, and conditional overrides. The DTCG 1.0
        Resolver Module provides a standardized approach to context-aware token
        resolution.
      </p>

      <h2>Resolver document structure</h2>
      <CodeBlock
        code={`{
  "$schema": "resolver.schema.json",
  "name": "Design System Resolver",
  "version": "2025-01-01",
  "description": "Context-aware token resolution",

  "sets": { ... },           // Token collections
  "modifiers": { ... },      // Value transformations
  "resolutionOrder": [ ... ] // Precedence rules
}`}
      />

      <h2>Sets: token collections</h2>
      <p>
        Sets define collections of tokens that can be combined during
        resolution. Each set can reference external files or define inline
        tokens.
      </p>
      <CodeBlock
        code={`{
  "sets": {
    "foundation": {
      "description": "Core design tokens",
      "sources": [{ "$ref": "core.tokens.json" }]
    },
    "semantic": {
      "description": "Semantic tokens referencing foundation",
      "sources": [{ "$ref": "semantic.tokens.json" }]
    },
    "brand-acme": {
      "description": "Acme brand overrides",
      "sources": [{ "$ref": "brands/acme.tokens.json" }]
    }
  }
}`}
      />

      <h2>Modifiers: context dimensions</h2>
      <p>
        Modifiers define dimensions of variation like theme, platform, or
        accessibility settings.
      </p>
      <CodeBlock
        code={`{
  "modifiers": {
    "theme": {
      "default": "light",
      "contexts": {
        "light": { "sources": [{ "$ref": "#/sets/foundation" }] },
        "dark": {
          "sources": [
            { "$ref": "#/sets/foundation" },
            { "$ref": "themes/dark.tokens.json" }
          ]
        }
      }
    }
  }
}`}
      />

      <h2>Resolution order</h2>
      <p>
        The resolution order defines precedence when multiple sets define the
        same token. Later entries override earlier ones.
      </p>
      <CodeBlock
        code={`{
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/sets/semantic" },
    { "$ref": "#/modifiers/theme" }
  ]
}`}
      />
      <ol>
        <li>Foundation tokens load first (base values)</li>
        <li>Semantic tokens override foundation where they conflict</li>
        <li>Theme modifier applies last, overriding both</li>
      </ol>

      <h2>Resolution contexts</h2>
      <CodeBlock
        code={`const context = {
  theme: "dark",
  platform: "ios",
  accessibility: "high-contrast"
};

const resolvedTokens = resolver.resolve(context);`}
      />

      <h2>Pitfalls to avoid</h2>
      <ul>
        <li><strong>Circular set references</strong> — sets cannot reference themselves or form cycles</li>
        <li><strong>Missing default contexts</strong> — every modifier should have a default</li>
        <li><strong>Inconsistent token coverage</strong> — all contexts within a modifier should define the same tokens</li>
        <li><strong>Wrong resolution order</strong> — more specific overrides should come later</li>
      </ul>
    </article>
  );
}

function SchemaValidationPanel() {
  return (
    <article>
      <h2>Why schema validation?</h2>
      <p>
        Design tokens are data, and data needs validation. Without it, typos
        become runtime bugs, invalid references break builds, and inconsistent
        formats cause cross-platform issues. Our validation strategy has two
        layers: JSON Schema for structural validation and IntelliSense, plus
        custom lint checks for semantic rules that JSON Schema can&apos;t
        express.
      </p>

      <h2>JSON Schema for DTCG tokens</h2>
      <CodeBlock
        code={`{
  "$schema": "./designTokens.schema.json",
  "color": {
    "palette": {
      "blue": {
        "500": {
          "$type": "color",
          "$value": "#0a65fe"
        }
      }
    }
  }
}`}
      />

      <h2>Custom lint checks</h2>
      <p>
        JSON Schema validates structure, but some rules require semantic
        analysis. Our custom validator adds these checks:
      </p>
      <ol>
        <li><strong>Circular reference detection</strong> — references cannot form cycles</li>
        <li><strong>Missing reference targets</strong> — references must point to tokens that exist</li>
        <li><strong>Type compatibility</strong> — references must resolve to compatible types</li>
        <li><strong>Unit validation</strong> — dimensions must have valid units (px, rem only)</li>
        <li><strong>Suspicious number values</strong> — large unitless numbers often indicate forgotten units</li>
      </ol>

      <h2>Editor IntelliSense</h2>
      <p>
        The schema enables rich editor support: autocomplete for{" "}
        <code>$type</code> values, inline errors for invalid values, hover
        documentation from <code>$description</code>, and go-to-definition for
        references.
      </p>

      <h2>Pitfalls to avoid</h2>
      <ul>
        <li><strong>Ignoring validation errors</strong> — don&apos;t bypass them with <code>--force</code> flags</li>
        <li><strong>Outdated schema</strong> — regenerate when adding new token types or extensions</li>
        <li><strong>Missing schema reference</strong> — token files without <code>$schema</code> lose IntelliSense</li>
        <li><strong>Overly permissive patterns</strong> — fix the token, not the schema</li>
      </ul>
    </article>
  );
}

function BuildOutputsPanel() {
  return (
    <article>
      <h2>Why build outputs matter</h2>
      <p>
        Design tokens are only valuable when they&apos;re consumable. Raw JSON
        files are the source of truth, but applications need CSS custom
        properties, SCSS variables, and TypeScript types. The build pipeline
        transforms authored tokens into these artifacts, ensuring a single
        source of truth propagates consistently across all consumers.
      </p>

      <h2>The build pipeline</h2>
      <CodeBlock
        code={`Source Files                    Build Stages                    Outputs
─────────────────              ─────────────                   ─────────
core/*.tokens.json      ──┐
                          ├──▶  Compose  ──▶  designTokens.json
semantic/*.tokens.json  ──┘         │
                                    ├──────▶  designTokens.scss (CSS vars)
                                    │
                                    ├──────▶  *.tokens.generated.scss (per-component)
                                    │
                                    └──────▶  types/designTokens.ts (TypeScript)`}
      />

      <h2>Output artifacts</h2>

      <h3>Global CSS custom properties</h3>
      <CodeBlock
        code={`:root {
  --core-color-palette-neutral-600: #555555;
  --core-color-mode-dark: #141414;
  --semantic-color-foreground-primary: var(--core-color-mode-dark);
}

[data-theme="dark"] {
  --semantic-color-foreground-primary: var(--core-color-mode-light);
}`}
      />

      <h3>Component-scoped SCSS</h3>
      <CodeBlock
        filename="Button.tokens.generated.scss"
        code={`// Auto-generated - do not edit manually
$button-primary-background: var(--semantic-components-button-primary-background);
$button-primary-foreground: var(--semantic-components-button-primary-foreground);
$button-primary-border: var(--semantic-components-button-primary-border);`}
      />

      <h3>TypeScript token paths</h3>
      <CodeBlock
        code={`export type TokenPath =
  | 'core.color.palette.neutral.100'
  | 'semantic.color.foreground.primary'
  | 'semantic.components.button.primary.background';

export function getTokenVar(path: TokenPath): string;`}
      />

      <h2>Pitfalls to avoid</h2>
      <ul>
        <li><strong>Editing generated files</strong> — changes will be overwritten on the next build</li>
        <li><strong>Forgetting to rebuild</strong> — token changes don&apos;t appear until the build runs</li>
        <li><strong>Circular references in output</strong> — caught by the validator at build time</li>
        <li><strong>Missing token types</strong> — regenerate types after adding new tokens</li>
      </ul>
    </article>
  );
}

function A11yTokensPanel() {
  return (
    <article>
      <h2>Why accessibility belongs in tokens</h2>
      <p>
        Accessibility is often treated as an afterthought — something to audit
        and fix before launch. But when accessibility decisions are encoded at
        the token level, they become defaults that every component inherits
        automatically. Teams don&apos;t have to remember to check contrast
        ratios or respect motion preferences; the system handles it.
      </p>

      <h2>Contrast-aware color tokens</h2>
      <p>
        WCAG 2.1 requires a minimum contrast ratio of 4.5:1 for normal text and
        3:1 for large text. Semantic color tokens are designed as pairs. Each
        foreground token has a corresponding background it&apos;s designed to
        work with.
      </p>
      <table className="props-table">
        <thead>
          <tr><th>Foreground token</th><th>Designed for</th><th>Min contrast</th></tr>
        </thead>
        <tbody>
          <tr><td><code>foreground.primary</code></td><td><code>background.primary</code></td><td>7:1 (AAA)</td></tr>
          <tr><td><code>foreground.secondary</code></td><td><code>background.primary</code></td><td>4.5:1 (AA)</td></tr>
          <tr><td><code>foreground.tertiary</code></td><td><code>background.primary</code></td><td>4.5:1 (AA)</td></tr>
          <tr><td><code>foreground.inverse</code></td><td><code>background.brand</code></td><td>4.5:1 (AA)</td></tr>
          <tr><td><code>status.danger</code></td><td><code>background.primary</code></td><td>4.5:1 (AA)</td></tr>
        </tbody>
      </table>

      <h2>Motion tokens with reduced motion</h2>
      <p>
        Some users experience vestibular disorders, motion sickness, or
        cognitive difficulties with animations. Motion duration tokens include
        reduced-motion variants:
      </p>
      <CodeBlock
        code={`{
  "motion": {
    "duration": {
      "short": {
        "$type": "duration",
        "$value": "150ms",
        "$extensions": {
          "design.paths.default": "150ms",
          "design.paths.reduced": "0ms"
        }
      }
    }
  }
}

/* Generated CSS */
:root { --motion-duration-short: 150ms; }

@media (prefers-reduced-motion: reduce) {
  :root { --motion-duration-short: 0ms; }
}`}
      />

      <h2>Minimum target sizes</h2>
      <p>
        WCAG 2.2 requires interactive targets to be at least 24x24 CSS pixels,
        with a recommendation of 44x44 for touch interfaces.
      </p>
      <CodeBlock
        code={`{
  "interaction": {
    "target": {
      "minimum":     { "$value": "24px" },
      "comfortable": { "$value": "44px" },
      "large":       { "$value": "48px" }
    }
  }
}`}
      />

      <h2>Focus indicators</h2>
      <p>
        Keyboard users rely on visible focus indicators to navigate interfaces.
        Tokens define consistent, accessible focus styles that work across all
        components.
      </p>
      <CodeBlock
        code={`:focus-visible {
  outline: var(--focus-ring-width) var(--focus-outline-style) var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

@media (forced-colors: active) {
  :focus-visible { outline: 3px solid CanvasText; }
}`}
      />

      <h2>Pitfalls to avoid</h2>
      <ul>
        <li><strong>Relying on color alone</strong> — pair color with text, icons, or patterns</li>
        <li><strong>Disabling focus indicators</strong> — never remove without providing an alternative</li>
        <li><strong>Ignoring reduced motion</strong> — always respect <code>prefers-reduced-motion</code></li>
        <li><strong>Assuming contrast is enough</strong> — text also needs appropriate size, spacing, and styling</li>
      </ul>
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

function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  return (
    <div style={{ margin: "var(--space-4) 0" }}>
      <CodeViewer code={code} filename={filename} />
    </div>
  );
}
