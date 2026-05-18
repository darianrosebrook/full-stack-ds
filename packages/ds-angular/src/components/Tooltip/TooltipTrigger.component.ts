// @generated:start imports
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { TooltipTriggerDirective } from "./TooltipTrigger.directive.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start component
/**
 * Default-host trigger component. Renders a <button> and adopts
 * it as the anchor via the same [fsdsTooltipTrigger] directive
 * consumers use for their own elements. Both default-host and
 * host-adoption funnel through the directive's registration.
 */
@Component({
  selector: "fsds-tooltip-trigger",
  standalone: true,
  imports: [TooltipTriggerDirective],
  template: `<button type="button" fsdsTooltipTrigger><ng-content /></button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipTriggerComponent {}
// @generated:end

// @custom:start trailing

// @custom:end
