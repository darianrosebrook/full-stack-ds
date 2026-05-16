// @generated:start imports
import type { ReactiveControllerHost } from 'lit';
import { AnchorToggleController, ControllableStateController, PortalController } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface CommandBehaviorOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  search?: () => string | undefined;
  defaultSearch?: string;
  onSearchChange?: (value: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export class CommandBehavior {
  readonly searchState: ControllableStateController<string>;
  readonly anchorToggle: AnchorToggleController;
  readonly portal: PortalController;

  constructor(host: ReactiveControllerHost, private opts: CommandBehaviorOptions = {}) {
    this.searchState = new ControllableStateController<string>(host, {
      controlled: opts.search,
      defaultValue: opts.defaultSearch ?? "",
      onChange: opts.onSearchChange,
    });
    this.anchorToggle = new AnchorToggleController(
      host as ReactiveControllerHost & EventTarget,
      {
        open: opts.open,
        defaultOpen: opts.defaultOpen ?? false,
        onOpenChange: opts.onOpenChange,
      },
    );
    this.portal = new PortalController(host, {
      enabled: true,
      getTarget: () => undefined,
    });
  }

  get open(): boolean { return this.anchorToggle.open; }
  setOpen(value: boolean) { this.anchorToggle.setOpen(value); }

  get search(): string { return this.searchState.value; }
  setSearch(value: string) { this.searchState.set(value); }
}
// @generated:end

// @custom:start trailing

// @custom:end
