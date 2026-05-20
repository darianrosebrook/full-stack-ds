// @generated:start imports
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { PopoverTriggerDirective } from "./PopoverTrigger.directive.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start component
/**
 * Default-host trigger component. Renders a <button> and adopts
 * it as the anchor via the same [fsdsPopoverTrigger] directive
 * consumers use for their own elements. Both default-host and
 * host-adoption funnel through the directive's registration.
 */
@Component({
  selector: "fsds-popover-trigger",
  standalone: true,
  imports: [PopoverTriggerDirective],
  template: `<button type="button" fsdsPopoverTrigger><ng-content /></button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverTriggerComponent {}
// @generated:end

// @custom:start trailing

// @custom:end
