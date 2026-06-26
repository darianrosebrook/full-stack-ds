// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgSwitch, NgSwitchCase } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CodeSnippetElement = "code" | "kbd" | "samp";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-code-snippet",
  standalone: true,
  imports: [NgClass, NgSwitch, NgSwitchCase],
  template: `<ng-container [ngSwitch]="this.as || 'code'">
  <code [ngClass]="classes()" spellcheck="false" *ngSwitchCase="'code'">
    {{ text }}
  </code>
  <kbd [ngClass]="classes()" spellcheck="false" *ngSwitchCase="'kbd'">
    {{ text }}
  </kbd>
  <samp [ngClass]="classes()" spellcheck="false" *ngSwitchCase="'samp'">
    {{ text }}
  </samp>
</ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeSnippetComponent {
  @Input() text!: string;
  @Input() as?: CodeSnippetElement = "code";
  @Input() class?: string;

  classes(): string {
    return [
      "code-snippet",
      this.as ? `code-snippet--${this.as}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
