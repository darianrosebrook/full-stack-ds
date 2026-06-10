// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useSheet } from "./useSheet.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SheetSide = "top" | "right" | "bottom" | "left";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-sheet",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()">
  <ng-container *ngIf="behavior.openness()">
    <div [ngClass]="'sheet__overlay'" aria-hidden="true" role="presentation" (click)="behavior.setOpenness(false)"></div>
  </ng-container>
  <ng-container *ngIf="behavior.openness()">
    <div [ngClass]="'sheet__content'" role="dialog" aria-modal="true" aria-labelledby="sheet-title-id" aria-describedby="sheet-description-id" [attr.data-side]="side">
      <div [ngClass]="'sheet__header'">
        <h2 [ngClass]="'sheet__title'">
          <ng-content select="[slot=title]" />
        </h2>
        <p [ngClass]="'sheet__description'">
          <ng-content select="[slot=description]" />
        </p>
        <button [ngClass]="'sheet__close'" type="button" aria-label="Close sheet" (click)="handleOpennessChange($event)"></button>
      </div>
      <div [ngClass]="'sheet__body'">
        <ng-content />
      </div>
      <div [ngClass]="'sheet__footer'"></div>
    </div>
  </ng-container>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetComponent {
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() onOpenChange?: (open: boolean) => void;
  @Input() side?: SheetSide = "right";
  @Input() modal?: boolean = true;
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useSheet({
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "sheet",
      this.side ? `sheet--${this.side}` : null,
      this.behavior.openness() ? "sheet--open" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleOpennessChange(event: Event): void {
    this.behavior.setOpenness((event.target as HTMLInputElement).checked);
  }
}

@Component({
  selector: "fsds-sheet-content",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetContentComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["sheet__content", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-sheet-header",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="header" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetHeaderComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["sheet__header", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-sheet-title",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="h3" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetTitleComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["sheet__title", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-sheet-description",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="p" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetDescriptionComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["sheet__description", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-sheet-body",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetBodyComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["sheet__body", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-sheet-footer",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="footer" variant="horizontal" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetFooterComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["sheet__footer", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
