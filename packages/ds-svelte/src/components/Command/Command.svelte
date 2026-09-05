<script lang="ts">
// @generated:start imports
import { useCommand } from "./useCommand.svelte.js";
import { portal } from "../../primitives/index.js";
import Icon from "../Icon/Icon.svelte";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  searchLabel?: string;
  emptyMessage?: string;
  label?: string;
  shouldFilter?: boolean;
  filter?: ((value: string, search: string) => number) | undefined;
  class?: string;
  items?: import('svelte').Snippet;
}

let { open, defaultOpen, onOpenChange, search, defaultSearch, onSearchChange, placeholder = "Search...", searchLabel = "Search commands", emptyMessage = "No results found.", label = "Command palette", shouldFilter = true, filter, class: className, items }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useCommand({
  open: () => open,
  defaultOpen: () => defaultOpen,
  onOpenChange: () => onOpenChange,
  search: () => search,
  defaultSearch: () => defaultSearch,
  onSearchChange: () => onSearchChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "command",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @generated:start fieldAssociation
const instanceId = $props.id();
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} data-fsds-component="command" use:portal={{ enabled: true }}>
  {#if behavior.open}
  <div class={'command__overlay'} aria-hidden="true" onclick={(e) => { if (e.target === e.currentTarget) { behavior.setOpen(false); } }}></div>
  {/if}
  {#if behavior.open}
  <div class={'command__dialog'} role="dialog" aria-modal="true" aria-label={label}>
    <div class={'command__inputWrapper'}>
      <Icon class={'command__searchIcon'} name="search" size="sm" />
      <input class={'command__input'} type="search" role="combobox" aria-autocomplete="list" oninput={(e) => behavior.setSearch((e.currentTarget as HTMLInputElement).value)} aria-expanded={behavior.open} aria-label={searchLabel} placeholder={placeholder} value={behavior.search} id={`${instanceId}-input`} aria-controls={`${instanceId}-list`} />
    </div>
    <div class={'command__list'} role="listbox" id={`${instanceId}-list`} aria-labelledby={`${instanceId}-input`}>
      <div class={'command__empty'}></div>
      {@render items?.()}
      <div class={'command__separator'} role="separator" aria-hidden="true"></div>
    </div>
  </div>
  {/if}
</div>
