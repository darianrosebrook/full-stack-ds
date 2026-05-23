import { Tabs, TabsList, TabsTab } from "@full-stack-ds/react";
import { buildHref, type A11yTab } from "../router";
import { CodeViewer } from "../components/CodeViewer";

interface AccessibilityViewProps {
  tab: A11yTab;
}

const TABS: { value: A11yTab; label: string }[] = [
  { value: "overview", label: "Philosophy" },
  { value: "standards", label: "Standards & POUR" },
  { value: "assistive-tech", label: "Assistive tech" },
  { value: "tokens", label: "A11y tokens" },
  { value: "tooling", label: "Tooling" },
];

function handleTabChange(next: string) {
  const tab = next as A11yTab;
  window.location.hash = buildHref({ kind: "a11y", tab }).slice(1);
}

export function AccessibilityView({ tab }: AccessibilityViewProps) {
  return (
    <div className="page">
      <p className="page-eyebrow">Standards · Accessibility</p>
      <h1 className="page-title">Accessibility by default</h1>
      <p className="page-lede">
        Accessibility is not a feature you add at the end. It&apos;s a
        constraint that shapes the system from the foundation up — encoded in
        primitives, enforced by composers, validated by tokens, and exercised
        by every component the system emits.
      </p>

      <Tabs
        appearance="pills"
        value={tab}
        onValueChange={handleTabChange}
        aria-label="Accessibility topic"
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
        {tab === "overview" && <PhilosophyPanel />}
        {tab === "standards" && <StandardsPanel />}
        {tab === "assistive-tech" && <AssistiveTechPanel />}
        {tab === "tokens" && <A11yTokensPanel />}
        {tab === "tooling" && <ToolingPanel />}
      </div>
    </div>
  );
}

function PhilosophyPanel() {
  return (
    <article>
      <h2>Why accessibility belongs in the system</h2>
      <p>
        Accessibility is more than a checklist — it&apos;s a mindset that
        enhances design decision-making and expands usability for everyone.
        When accessibility decisions are encoded at the system level
        (primitives, compounds, composers, tokens), they become defaults that
        every product inherits automatically. Teams don&apos;t have to remember
        to check contrast ratios or wire up <code>aria-describedby</code>; the
        system handles it.
      </p>
      <p>
        This is the difference between &ldquo;audit and fix&rdquo; and
        &ldquo;accessible by default.&rdquo; Audit-and-fix scales linearly with
        product surface — every new feature requires another a11y review.
        Accessible-by-default scales with the system — fix the primitive once
        and every downstream consumer benefits.
      </p>

      <h2>Why it matters</h2>
      <ul>
        <li>
          <strong>Legal compliance:</strong> meeting WCAG 2.1 Level AA is a
          baseline expectation, not a stretch goal, in most jurisdictions.
        </li>
        <li>
          <strong>User inclusion:</strong> a real percentage of every product&apos;s
          users have a disability — temporary, situational, or permanent.
        </li>
        <li>
          <strong>Better UX for everyone:</strong> keyboard support, sufficient
          contrast, and clear error messaging improve the experience for users
          without disabilities too.
        </li>
        <li>
          <strong>Business value:</strong> expanding who can use the product
          expands the market it can reach.
        </li>
      </ul>

      <h2>The system&apos;s accessibility surface</h2>
      <p>
        Accessibility shows up at every layer of the system. Each layer has a
        different responsibility, and getting them all right is what produces
        an interface that genuinely works for everyone:
      </p>
      <ul>
        <li>
          <strong>Primitives</strong> handle the basics: semantic HTML, focus
          visibility, keyboard activation, ARIA defaults, minimum target sizes.
        </li>
        <li>
          <strong>Compounds</strong> own the wiring: label association,{" "}
          <code>aria-describedby</code> chains, error roles, required-field
          announcements.
        </li>
        <li>
          <strong>Composers</strong> orchestrate the harder stuff: focus
          trapping, focus restoration, roving tabindex, escape-key dismissal,
          live region updates.
        </li>
        <li>
          <strong>Tokens</strong> encode the constraints: contrast-aware color
          pairs, reduced-motion durations, minimum dimensions for interactive
          targets, focus-ring width and color.
        </li>
      </ul>

      <h2>The discipline</h2>
      <p>
        The hard part of accessibility isn&apos;t any individual rule —
        it&apos;s holding the discipline across all of them, consistently, for
        every component, in every framework, every time. The whole point of
        moving accessibility into the system is that the discipline lives
        somewhere where it can be enforced once and inherited everywhere
        downstream.
      </p>
    </article>
  );
}

function StandardsPanel() {
  return (
    <article>
      <h2>WCAG 2.1+ Level AA</h2>
      <p>
        All components in the system target WCAG 2.1 Level AA. The four POUR
        principles structure how those requirements decompose:
      </p>
      <ul>
        <li>
          <strong>Perceivable:</strong> text alternatives for non-text content,
          captions, sufficient color contrast, content that doesn&apos;t rely
          on color or sensory characteristics alone.
        </li>
        <li>
          <strong>Operable:</strong> keyboard accessibility, no seizure-inducing
          content, sufficient time for interactions, predictable navigation.
        </li>
        <li>
          <strong>Understandable:</strong> readable text, predictable behavior,
          input assistance that explains errors and suggests corrections.
        </li>
        <li>
          <strong>Robust:</strong> compatible with current and future assistive
          technologies, valid markup, well-formed ARIA.
        </li>
      </ul>

      <h2>Core requirements</h2>

      <h3>1. Semantic HTML</h3>
      <p>Use semantic HTML elements that convey meaning. Native elements come with native a11y — generic elements don&apos;t.</p>
      <CodeViewer
        code={`// BAD: generic elements
<div onClick={handleClick}>Click me</div>
<span role="button">Submit</span>

// GOOD: semantic elements
<button onClick={handleClick}>Click me</button>
<button type="submit">Submit</button>`}
      />

      <h3>2. Keyboard navigation</h3>
      <p>All interactive elements must be keyboard accessible.</p>
      <CodeViewer
        code={`// Native button already handles keyboard - no extra code needed
<button onClick={handleClick}>Click me</button>

// If you must build a custom interactive surface, replicate the contract
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
      <p>Use ARIA when HTML semantics aren&apos;t sufficient.</p>
      <CodeViewer
        code={`// ARIA for complex components
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure you want to continue?</p>
</div>

// ARIA for dynamic content
<div aria-live="polite" aria-atomic="true">
  {loading ? 'Loading...' : 'Content loaded'}
</div>`}
      />

      <h3>4. Color contrast</h3>
      <table className="props-table">
        <thead>
          <tr><th>Content</th><th>Minimum (AA)</th><th>Enhanced (AAA)</th></tr>
        </thead>
        <tbody>
          <tr><td>Normal text</td><td>4.5:1</td><td>7:1</td></tr>
          <tr><td>Large text (≥18pt or ≥14pt bold)</td><td>3:1</td><td>4.5:1</td></tr>
          <tr><td>UI components &amp; graphical objects</td><td>3:1</td><td>—</td></tr>
        </tbody>
      </table>

      <h3>5. Focus management</h3>
      <p>Focus must be visible and properly managed.</p>
      <CodeViewer
        code={`/* Visible focus indicator */
.button:focus-visible {
  outline: 2px solid var(--semantic-color-border-focus);
  outline-offset: 2px;
}

/* Focus trapping in modals (composer territory) */
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
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
        <li>Minimum 44×44px touch target on coarse pointers.</li>
      </ul>

      <h3>Form controls</h3>
      <ul>
        <li>Associate labels with inputs using <code>htmlFor</code>/<code>id</code>.</li>
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

      <h2>Common pitfalls</h2>

      <h3>1. Missing labels</h3>
      <CodeViewer
        code={`// BAD: no label
<input type="text" />

// GOOD: associated label
<label htmlFor="email">Email</label>
<input id="email" type="email" />`}
      />

      <h3>2. Keyboard traps</h3>
      <CodeViewer
        code={`// BAD: focus can't escape
<div onKeyDown={(e) => e.preventDefault()}>
  {/* keystrokes consumed unconditionally */}
</div>

// GOOD: only handle keys you mean to handle
<div onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
  {/* tab and shift+tab still work */}
</div>`}
      />

      <h3>3. Insufficient color contrast</h3>
      <CodeViewer
        code={`// BAD: 1.2:1 contrast — invisible to many users
.button { background: #ccc; color: #ddd; }

// GOOD: 4.5:1+ — drive from semantic tokens, not raw hex
.button {
  background: var(--semantic-color-background-accent);
  color:      var(--semantic-color-foreground-on-accent);
}`}
      />

      <h3>4. Missing accessible names on icon-only controls</h3>
      <CodeViewer
        code={`// BAD: a screen reader user hears "button"
<button onClick={handleClose}><Icon name="close" /></button>

// GOOD: clear, explicit label
<button onClick={handleClose} aria-label="Close dialog">
  <Icon name="close" aria-hidden />
</button>`}
      />
    </article>
  );
}

function AssistiveTechPanel() {
  return (
    <article>
      <h2>Supporting assistive technology</h2>
      <p>
        Assistive technologies — screen readers, switch devices, voice control,
        screen magnifiers, refreshable braille displays — are how a substantial
        slice of users actually interact with the product. Supporting them well
        is mostly a matter of getting the basics right and not actively
        breaking the platform&apos;s defaults.
      </p>

      <h2>Screen readers</h2>
      <ul>
        <li>
          <strong>VoiceOver</strong> — macOS / iOS / iPadOS. The default test
          target for Apple platforms.
        </li>
        <li>
          <strong>NVDA</strong> — free, open-source, Windows. The default test
          target for Windows web development.
        </li>
        <li>
          <strong>JAWS</strong> — commercial, Windows. Still widely used in
          enterprise contexts.
        </li>
        <li>
          <strong>TalkBack</strong> — Android.
        </li>
      </ul>
      <p>
        Real screen-reader testing means running the actual software, not just
        passing axe. A node can be valid markup, pass automated checks, and
        still produce a confusing or broken experience with VoiceOver. Test
        the flows that matter — sign-in, primary CTAs, error recovery — on at
        least one screen reader before shipping.
      </p>

      <h2>Keyboard navigation</h2>
      <ul>
        <li>
          Every interactive surface must be reachable and operable with the
          keyboard alone.
        </li>
        <li>
          Tab order should match visual order. If it doesn&apos;t, fix the DOM
          order before reaching for <code>tabindex</code>.
        </li>
        <li>
          Avoid positive <code>tabindex</code> values. Use <code>0</code> to
          make something focusable and <code>-1</code> to remove it from the
          tab order while keeping it programmatically focusable.
        </li>
        <li>
          Composers like menus, listboxes, and toolbars use{" "}
          <strong>roving tabindex</strong> rather than putting every child in
          the tab order.
        </li>
      </ul>

      <h2>ARIA: use sparingly, use correctly</h2>
      <p>
        The first rule of ARIA is{" "}
        <em>don&apos;t use ARIA if a native element does the job</em>. ARIA
        layers semantics on top of HTML; native elements come with semantics
        already attached. Reach for ARIA when you&apos;re building something
        the platform doesn&apos;t provide (a tabs widget, a combobox, a
        custom menu) and follow the WAI-ARIA Authoring Practices for the
        pattern.
      </p>
      <CodeViewer
        code={`// Custom combobox needs explicit semantics
<div role="combobox"
     aria-expanded={isOpen}
     aria-controls="listbox-1"
     aria-owns="listbox-1"
     aria-haspopup="listbox">
  <input
    role="searchbox"
    aria-autocomplete="list"
    aria-activedescendant={activeOptionId}
    aria-controls="listbox-1"
  />
</div>
<ul id="listbox-1" role="listbox">
  {/* options with role="option" and aria-selected */}
</ul>`}
      />

      <h2>Focus management</h2>
      <ul>
        <li>
          <strong>Visible focus indicator</strong> on every focusable element —
          driven by tokens, not removed for aesthetic reasons.
        </li>
        <li>
          <strong>Focus trapping</strong> inside modal surfaces (dialogs,
          drawers, popovers with modal semantics).
        </li>
        <li>
          <strong>Focus restoration</strong> back to the triggering element
          when a modal surface closes.
        </li>
        <li>
          <strong>Skip links</strong> at the top of every page so keyboard
          users can bypass repeated navigation.
        </li>
      </ul>

      <h2>Live regions</h2>
      <p>
        Dynamic content updates (toasts, validation messages, async results)
        should be announced via ARIA live regions. Choose politeness level
        based on urgency:
      </p>
      <ul>
        <li>
          <code>aria-live=&quot;polite&quot;</code> — most updates. Announces
          when the screen reader is idle.
        </li>
        <li>
          <code>aria-live=&quot;assertive&quot;</code> — only for truly urgent
          messages that interrupt the user (e.g., session expiring, payment
          failure).
        </li>
        <li>
          <code>role=&quot;alert&quot;</code> — equivalent to assertive live
          region; use for inline form errors.
        </li>
      </ul>
    </article>
  );
}

function A11yTokensPanel() {
  return (
    <article>
      <h2>Encoding accessibility in tokens</h2>
      <p>
        The fastest way to keep accessibility consistent across a system is to
        encode it into the tokens that everything else inherits. This page
        summarizes how that lands in the token layer; for the deeper
        rationale, see{" "}
        <a href={buildHref({ kind: "tokens-philosophy", tab: "accessibility" })}>
          Tokens philosophy → Accessibility by default
        </a>
        .
      </p>

      <h2>Contrast-aware color pairs</h2>
      <p>
        Semantic color tokens are designed as foreground/background pairs.
        Each foreground token is vetted against the background it&apos;s
        intended to sit on:
      </p>
      <table className="props-table">
        <thead>
          <tr><th>Foreground</th><th>Designed for</th><th>Min contrast</th></tr>
        </thead>
        <tbody>
          <tr><td><code>foreground.primary</code></td><td><code>background.primary</code></td><td>7:1 (AAA)</td></tr>
          <tr><td><code>foreground.secondary</code></td><td><code>background.primary</code></td><td>4.5:1 (AA)</td></tr>
          <tr><td><code>foreground.tertiary</code></td><td><code>background.primary</code></td><td>4.5:1 (AA)</td></tr>
          <tr><td><code>foreground.inverse</code></td><td><code>background.brand</code></td><td>4.5:1 (AA)</td></tr>
          <tr><td><code>status.danger</code></td><td><code>background.primary</code></td><td>4.5:1 (AA)</td></tr>
        </tbody>
      </table>

      <h2>Reduced motion</h2>
      <CodeViewer
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
      <CodeViewer
        code={`{
  "interaction": {
    "target": {
      "minimum":     { "$value": "24px" },  /* WCAG 2.2 minimum */
      "comfortable": { "$value": "44px" },  /* recommended touch target */
      "large":       { "$value": "48px" }   /* primary actions */
    }
  }
}`}
      />

      <h2>Focus indicators</h2>
      <CodeViewer
        code={`:focus-visible {
  outline: var(--focus-ring-width) var(--focus-outline-style) var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

@media (forced-colors: active) {
  :focus-visible { outline: 3px solid CanvasText; }
}`}
      />
    </article>
  );
}

function ToolingPanel() {
  return (
    <article>
      <h2>Automated testing</h2>
      <p>
        Automated tools catch a meaningful fraction of accessibility
        regressions cheaply — but they miss the ones that need human judgment.
        Run them as a gate, but don&apos;t treat a passing axe run as proof of
        accessibility.
      </p>
      <ul>
        <li>
          <strong>axe-core / jest-axe</strong> — unit-test accessibility
          violations. Cheap, runs in CI, catches the obvious stuff (missing
          labels, low contrast, invalid ARIA).
        </li>
        <li>
          <strong>Lighthouse</strong> — page-level audit that includes
          accessibility scoring alongside performance and SEO.
        </li>
        <li>
          <strong>Playwright a11y assertions</strong> — integration-level
          accessibility checks alongside the existing E2E suite.
        </li>
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

      <h2>Manual testing</h2>
      <p>
        The things automated tools can&apos;t catch — broken focus order,
        confusing screen-reader announcements, motion that triggers vestibular
        symptoms — need to be tested with the actual assistive technology.
        Build manual a11y testing into the same workflow as visual QA.
      </p>
      <ul>
        <li>
          <strong>Screen readers</strong> — VoiceOver on macOS/iOS, NVDA on
          Windows. Real screen-reader output is the only way to catch
          announcements that read confusingly.
        </li>
        <li>
          <strong>Keyboard only</strong> — unplug the mouse, navigate the
          flow. If you can&apos;t reach something or get stuck, keyboard users
          can&apos;t either.
        </li>
        <li>
          <strong>Browser zoom &amp; text zoom</strong> — test at 200% zoom
          and at 200% text-only zoom. Layout that breaks at zoom fails AA.
        </li>
        <li>
          <strong>Forced colors</strong> — Windows High Contrast mode and
          equivalent. Custom focus rings often vanish without explicit
          forced-colors handling.
        </li>
        <li>
          <strong>Reduced motion</strong> — toggle the OS setting and confirm
          animations gracefully degrade.
        </li>
      </ul>

      <h2>Design-tool integration</h2>
      <ul>
        <li>
          <strong>Stark / Able / Figma a11y plugins</strong> — catch contrast
          and color-blindness issues at the design stage, before any code is
          written.
        </li>
        <li>
          <strong>Design token sync</strong> — feeding contrast-validated
          tokens into the design tool keeps designers from choosing values
          that&apos;ll fail downstream.
        </li>
      </ul>

      <h2>What tooling can&apos;t replace</h2>
      <p>
        Tooling is a force multiplier on attention, not a substitute for it.
        The most expensive accessibility bugs are the ones that pass every
        automated check and still leave a user unable to complete a task:
        broken focus management in a modal, a live region that announces too
        aggressively, a confusing reading order. Build the discipline of
        running through your flows with a screen reader and a keyboard the
        same way you&apos;d run through them visually.
      </p>
    </article>
  );
}
