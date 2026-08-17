// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf, NgFor } from "@angular/common";
import { tokenizeCode } from "../../primitives/highlight/tokenize.js";
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
  imports: [NgClass, NgIf, NgFor],
  host: { "data-fsds-component": "code-block" },
  template: `<pre [ngClass]="classes()" [attr.data-language]="language">
  <code [ngClass]="'code-block__code'" spellcheck="false" [attr.data-language]="language">
    <ng-container *ngIf="(highlight ?? true)"><span *ngFor="let token of highlightTokens" [ngClass]="'code-block__token'" [attr.data-token]="token.kind">{{ token.text }}</span></ng-container>
    <ng-container *ngIf="!((highlight ?? true))">{{ code }}</ng-container>
  </code>
</pre>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlockComponent {
  @Input() code!: string;
  @Input() language!: CodeBlockLanguage;
  @Input() highlight?: boolean = true;
  @Input() class?: string;

  classes(): string {
    return [
      "code-block",
      this.class,
    ].filter(Boolean).join(" ");
  }

  get highlightTokens(): Array<{ kind: string; text: string }> {
    return tokenizeCode(this.code, this.language);
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
