import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";

/**
 * Stack layout primitive for Full Stack DS Lit components.
 *
 * Provides a layout container that maps to the contract-driven Stack
 * primitive used across all framework targets. The host element carries
 * BEM class names applied by the enclosing component; the Stack element
 * itself is transparent to layout via `display: contents`.
 *
 * `role` is reflected to the host attribute via attributeChangedCallback
 * (Lit's reflect: true) so that generated components emitting
 * `<fsds-stack role="...">` get correct accessibility semantics.
 *
 * `as` is accepted as a typed property mirroring the Vue / Svelte Stack
 * API. Custom-element tag names are fixed (the host is always
 * `<fsds-stack>`), so the `as` value is advisory only — the rendered tag
 * does not change. Real semantic-element re-target requires Lit's
 * `unsafeStatic` or a per-tag render branch; deferred until generated
 * Lit components have render tests exercising the difference.
 */
export class StackElement extends LitElement {
  static styles = css`
    :host {
      box-sizing: border-box;
    }

    :host([layout="stack"]) {
      display: flex;
    }

    :host([layout="inline-stack"]) {
      display: inline-flex;
    }

    :host([layout="block"]) {
      display: block;
    }

    :host([layout="inline"]) {
      display: inline;
    }

    :host([layout="contents"]) {
      display: contents;
    }

    :host([variant="vertical"]) {
      flex-direction: column;
    }

    :host([variant="horizontal"]) {
      flex-direction: row;
    }
  `;

  @property({ type: String, reflect: true })
  variant: "vertical" | "horizontal" = "vertical";

  @property({ type: String, reflect: true })
  layout: "stack" | "inline-stack" | "block" | "inline" | "contents" | "native" = "stack";

  @property({ type: String, reflect: true })
  override role: string | null = null;

  @property({ type: String })
  as?: keyof HTMLElementTagNameMap;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("fsds-stack", StackElement);
