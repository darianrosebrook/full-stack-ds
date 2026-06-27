// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CodeBlockLanguage = "bash" | "css" | "html" | "javascript" | "json" | "jsx" | "markdown" | "plaintext" | "tsx" | "typescript";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-code-block",
  standalone: true,
  imports: [NgClass],
  template: `<pre [ngClass]="classes()" [attr.data-language]="language">
  <code [ngClass]="'code-block__code'" spellcheck="false" [attr.data-language]="language">
    {{ code }}
  </code>
</pre>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlockComponent {
  @Input() code!: string;
  @Input() language!: CodeBlockLanguage;
  @Input() class?: string;

  classes(): string {
    return [
      "code-block",
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
