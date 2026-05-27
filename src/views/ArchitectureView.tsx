import type { Bundle } from "../types/data";

interface ArchitectureViewProps {
  bundle: Bundle;
}

/**
 * Architecture view: surfaces the architectural claim this codebase is an
 * existence proof for. The full long-form argument lives in
 * `docs/normal-form.md`; this view is the site-facing summary so a visitor
 * landing on the showcase can find the claim from the navigation rather than
 * only by reading the repo.
 */
export function ArchitectureView({ bundle }: ArchitectureViewProps) {
  const componentCount = bundle.components.length;
  return (
    <div className="page">
      <p className="page-eyebrow">Architecture</p>
      <h1 className="page-title">
        A claim about compositional systems,<br />
        with a design system as the existence proof.
      </h1>
      <p className="page-lede">
        This repository is not, primarily, a design system. It is a falsifiable
        claim about compositional systems. The {componentCount} components, one
        primitive, and five frameworks exist to test the claim — not as
        product surface, but as the falsification surface that would make any
        wrongness in the contract visible.
      </p>

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">The claim</h2>
        </header>
        <div className="card card--inset">
          <p style={{ margin: 0 }}>
            Compositional systems — systems where higher-order artifacts are
            assembled from lower-order ones under shared constraints —
            converge on a single architectural shape. Systems that conform to
            it compose cleanly across heterogeneous targets, regenerate safely,
            and survive transfer to new substrates. Systems that resist it
            accumulate a predictable family of symptoms — shadow files,
            stubbed-out implementations, force-pushes around quality gates,
            runtime drift between layers, irreproducible builds — that no
            amount of after-the-fact tooling fully fixes.
          </p>
        </div>
      </section>

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">Why five frameworks</h2>
          <span className="section-meta">the falsification surface</span>
        </header>
        <p>
          Five frameworks is not a feature. It is the test. React hooks, Vue
          composables, Svelte runes, Angular signals, and Lit reactive
          controllers are structurally opposed paradigms — immutable virtual
          DOM with hooks versus mutable shadow DOM with controllers, function
          components versus classes, synthetic events versus native events.
          If the same contract can drive all five idiomatically without
          leaking implementation detail into any of them, the contract is at
          the right level of abstraction. If it cannot, the wrongness shows up
          as friction in exactly one output.
        </p>
      </section>

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">The discipline this is an instance of</h2>
        </header>
        <p>
          The operative concern is governance, not composition.
          &ldquo;Compositional&rdquo; describes the result; governance
          describes the work. A system has the normal form when the rules
          about what can be composed with what, by whom, and under what
          guarantees are encoded structurally — in contracts, IRs, fail-loud
          boundaries, mutable/immutable site discipline, and consumer-facing
          descriptors — rather than encoded socially in convention, review
          culture, or institutional memory.
        </p>
        <p>
          The point of encoding governance structurally is not control for its
          own sake. It is to <strong>raise the floor so the quality bar is
          easier to hit</strong>. Without the normal form, doing the right
          thing requires heroic effort by every contributor on every change.
          With it, the right thing is the path of least resistance, and the
          wrong thing is loud enough to be visible before it ships.
        </p>
      </section>

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">The seven properties</h2>
          <span className="section-meta">what a system in normal form looks like</span>
        </header>
        <ol className="arch-properties">
          <li>
            <strong>A typed contract that owns semantic authority.</strong>{" "}
            One place where the meaning of the artifact lives. Here:{" "}
            <code>packages/ds-contracts/&lt;Name&gt;.contract.json</code>.
          </li>
          <li>
            <strong>A framework-neutral intermediate representation.</strong>{" "}
            Derived from the contract by deterministic projection. Here:{" "}
            <code>packages/ds-codegen/src/ir.ts</code>.
          </li>
          <li>
            <strong>One small set of typed primitives that compose into everything.</strong>{" "}
            Here: <code>Stack</code>. {componentCount} components, one primitive.
          </li>
          <li>
            <strong>Multiple realization targets, each idiomatic, each derived from the IR with zero contract interpretation in target code.</strong>{" "}
            React, Vue, Svelte, Angular, Lit. The cost of adding the sixth
            framework is roughly the cost of writing one emitter that
            consumes a stable IR.
          </li>
          <li>
            <strong>Boundary linters that fail loud on references to non-existent contract entities.</strong>{" "}
            Here: <code>validateDomBindings</code> in <code>ir.ts</code> — the
            function does not log a warning or emit a literal string; it
            throws.
          </li>
          <li>
            <strong>Stable mutable/immutable site discipline that lets human edits survive regeneration.</strong>{" "}
            Here: <code>@generated</code> and <code>@custom</code> markers,
            enforced by the preservation layer.
          </li>
          <li>
            <strong>A consumer-facing descriptor projected from the contract that strips renderer-internal seams.</strong>{" "}
            Here: <code>packages/ds-contracts/a2ui/derive.ts</code> — the
            agent-facing projection that excludes <code>className</code>,{" "}
            <code>style</code>, refs, and DOM internals.
          </li>
        </ol>
        <p className="muted" style={{ marginTop: "var(--fsds-core-spacing-size-06)" }}>
          Drop any one of these and a predictable failure mode appears. The
          symptom catalog above — shadow files, stub-outs, force-pushes,
          drift, irreproducibility — is mostly diagnostic of which property
          is missing.
        </p>
      </section>

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">The move that produces it</h2>
          <span className="section-meta">a procedure, not a checklist</span>
        </header>
        <p>The seven properties are the outcome of a recurring methodological move:</p>
        <ol className="arch-move">
          <li>
            <strong>Refuse the surface request.</strong> &ldquo;Add a new
            component,&rdquo; &ldquo;add a new variant,&rdquo; &ldquo;add a
            new primitive.&rdquo; Take the request seriously enough to ask
            what it is actually asking for.
          </li>
          <li>
            <strong>Diagnose the actual ask.</strong> What is under-represented
            in the current contract? The diagnostic question is &ldquo;what
            is the contract missing that makes the obvious answer
            wrong?&rdquo;
          </li>
          <li>
            <strong>Name the domain-scoped trap.</strong> Most surface
            requests are domain-specific solutions to under-represented
            general problems.
          </li>
          <li>
            <strong>Lower the primitive while raising the governance.</strong>{" "}
            Push the new capability down into a primitive or contract field
            that all consumers can use. Simultaneously raise the governance
            to cover the new composition.
          </li>
          <li>
            <strong>Validate that governance survives the composition.</strong>{" "}
            The test is not &ldquo;does the new thing work.&rdquo; It is
            &ldquo;does the existing governance still apply.&rdquo;
          </li>
        </ol>
        <p>
          This is what produces the constraint of one primitive, many
          components. The constraint was not chosen aesthetically. It is the
          result of refusing the surface request &ldquo;add a new
          primitive&rdquo; often enough that the contract was forced to grow
          the fields that make the new primitive unnecessary.
        </p>
      </section>

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">Falsification</h2>
        </header>
        <p>The claim is broad. It is also narrow enough to be falsified:</p>
        <ul>
          <li>
            A compositional system that works well without one of the seven
            properties.
          </li>
          <li>
            A system with these seven properties that fails to compose.
          </li>
          <li>
            A class of compositional systems where the contract cannot be
            made framework-neutral — where the substrate fundamentally
            requires per-target semantic interpretation rather than just
            per-target syntactic translation.
          </li>
        </ul>
      </section>

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">Read the full argument</h2>
        </header>
        <p>
          The long-form argument — including the cross-substrate transfer
          evidence and the detailed treatment of the load-bearing
          function <code>validateDomBindings</code> — lives in{" "}
          <a
            href="https://github.com/darianrosebrook/full-stack-ds/blob/main/docs/normal-form.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            <code>docs/normal-form.md</code>
          </a>
          . This page is the site-facing summary.
        </p>
      </section>
    </div>
  );
}
