<script lang="ts">
// @generated:start imports
import { useCommand } from "./useCommand.svelte.js";
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
  emptyMessage?: string;
  label?: string;
  shouldFilter?: boolean;
  filter?: ((value: string, search: string) => number) | undefined;
  class?: string;
}

let { open, defaultOpen, onOpenChange, search, defaultSearch, onSearchChange, placeholder = "Search...", emptyMessage = "No results found.", label = "Command palette", shouldFilter = true, filter, class: className }: Props = $props();
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

// @custom:start trailing

// @custom:end
</script>

<div class={classes} role="dialog" onclick={(e) => { if (e.target === e.currentTarget) { behavior.setOpen(false); } }}>
  {#if behavior.open}
  <div class={'command__overlay'} aria-hidden="true"></div>
  {/if}
  {#if behavior.open}
  <div class={'command__dialog'} role="dialog" aria-modal="true" aria-label={label}>
    <div class={'command__inputWrapper'}>
      <span class={'command__searchIcon'} aria-hidden="true"></span>
      <input class={'command__input'} type="search" role="combobox" aria-autocomplete="list" aria-controls="fsds-command-listbox" aria-expanded={behavior.open} placeholder={placeholder} value={behavior.search} onchange={(e) => behavior.setSearch((e.currentTarget as HTMLInputElement).value)} />
    </div>
    <div class={'command__list'} role="listbox" id="fsds-command-listbox">
      <div class={'command__empty'}></div>
      <div class={'command__group'}>
        <div class={'command__groupHeading'}></div>
        <div class={'command__groupItems'}>
          <div class={'command__item'} role="option">
            <span class={'command__itemIcon'}></span>
            <div class={'command__itemContent'}>
              <span class={'command__itemLabel'}></span>
              <span class={'command__itemDescription'}></span>
            </div>
          </div>
        </div>
      </div>
      <div class={'command__separator'} role="separator" aria-hidden="true"></div>
    </div>
  </div>
  {/if}
</div>
