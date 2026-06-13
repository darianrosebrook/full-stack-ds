import {
  Component,
  Input,
  ChangeDetectionStrategy,
  HostBinding,
} from "@angular/core";

/**
 * Stack — the single layout primitive for Full Stack DS (Angular).
 *
 * All generated components render inside a <fsds-stack> so that layout
 * direction and semantic element are declared in one place.
 *
 * `role` is forwarded to the host element via @HostBinding so that
 * generated components emitting `<fsds-stack role="...">` get correct
 * accessibility semantics (e.g. `getByRole('switch')` resolves to the
 * fsds-stack host).
 *
 * `as` is accepted as a typed input, mirroring the Vue / Svelte Stack
 * API. Angular custom-element selectors are fixed (the host element is
 * always `<fsds-stack>`), so the `as` value is currently advisory only:
 * downstream tooling can read it, but the rendered tag does not change.
 * Replacing this with a real semantic-element re-target requires either
 * an attribute-selector Stack or per-tag *ngSwitch wrapping; neither is
 * worth the churn until the generated components have render tests
 * exercising the difference.
 */
@Component({
  selector: "fsds-stack",
  standalone: true,
  imports: [],
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackComponent {
  @Input() variant: "vertical" | "horizontal" = "vertical";
  @Input() layout: "stack" | "inline-stack" | "block" | "inline" | "contents" | "native" = "stack";
  @Input() className?: string;
  @Input() as?: keyof HTMLElementTagNameMap;
  @Input() role?: string;

  @HostBinding("class")
  get hostClass(): string {
    return ["fsds-stack", `fsds-stack--layout-${this.layout}`, `fsds-stack--${this.variant}`, this.className]
      .filter(Boolean)
      .join(" ");
  }

  @HostBinding("style.display")
  get hostDisplay(): string | null {
    switch (this.layout) {
      case "stack":
        return "flex";
      case "inline-stack":
        return "inline-flex";
      case "block":
        return "block";
      case "inline":
        return "inline";
      case "contents":
        return "contents";
      case "native":
        return null;
    }
  }

  @HostBinding("style.flex-direction")
  get hostFlexDirection(): string | null {
    return this.layout === "stack" || this.layout === "inline-stack"
      ? this.variant === "horizontal" ? "row" : "column"
      : null;
  }

  @HostBinding("attr.role")
  get hostRole(): string | null {
    return this.role ?? null;
  }
}
