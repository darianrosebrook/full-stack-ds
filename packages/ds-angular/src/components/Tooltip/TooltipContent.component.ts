// @generated:start imports
import {
  Component,
  ElementRef,
  HostBinding,
  AfterViewInit,
  OnDestroy,
  inject,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";
import { NgIf } from "@angular/common";
import { TooltipContextToken } from "./useTooltip.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-tooltip-content",
  standalone: true,
  imports: [NgIf],
  template: `<ng-container *ngIf="isOpen()"><ng-content /></ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipContentComponent implements AfterViewInit, OnDestroy {
  private elRef = inject(ElementRef<HTMLElement>);
  protected ctx = inject(TooltipContextToken, { optional: true });

  // The substrate uses content.contains(relatedTarget) for grace-
  // path checks. We register the host element so contains() sees
  // the consumer's projected children too (they live in light DOM
  // under us). Open-state is reflected via host bindings on the
  // same host element so ARIA + the data marker apply to the
  // exact node the substrate registered.
  protected isOpen = computed(() => this.ctx?.open() ?? false);

  @HostBinding("attr.id") get _id(): string | null {
    return this.isOpen() && this.ctx ? this.ctx.contentId : null;
  }

  @HostBinding("attr.role") get _role(): string | null {
    return this.isOpen() ? "tooltip" : null;
  }

  @HostBinding("attr.data-tooltip-content") get _dataMarker(): string | null {
    return this.isOpen() ? "" : null;
  }

  ngAfterViewInit(): void {
    this.ctx?.registerContent(this.elRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.ctx?.registerContent(null);
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
