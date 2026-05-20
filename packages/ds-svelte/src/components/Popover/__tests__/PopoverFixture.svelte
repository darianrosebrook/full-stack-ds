<script lang="ts">
// Test fixture for Popover presence-surface compound.
import Popover from "../Popover.svelte";
import PopoverTrigger from "../PopoverTrigger.svelte";
import PopoverContent from "../PopoverContent.svelte";

interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  closeOnOutsideClick?: boolean;
  /** When true, render the asChild snippet adoption path. */
  asChild?: boolean;
  /** Spy invoked from the adopted child's onclick handler.
   *  Used by the host-adoption tests to assert consumer handlers
   *  still run when composed with the substrate's handler. */
  consumerOnClick?: (event: MouseEvent) => void;
  /** When set, the consumer's handler calls preventDefault to
   *  exercise the substrate's consumer-opt-out contract. */
  consumerPreventsDefault?: boolean;
}

let {
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  closeOnEscape,
  closeOnBlur,
  closeOnOutsideClick,
  asChild,
  consumerOnClick,
  consumerPreventsDefault,
}: Props = $props();
</script>

<Popover
  {open}
  {defaultOpen}
  {onOpenChange}
  {disabled}
  {closeOnEscape}
  {closeOnBlur}
  {closeOnOutsideClick}
>
  {#if asChild}
    <PopoverTrigger asChild>
      {#snippet child(trigger)}
        <!--
          Split binding via `trigger` (action + attrs). Popover's
          openTriggers is ["click"], so the substrate handler is
          onclick. Consumer composition runs our handler first,
          optionally calls preventDefault, and only invokes the
          substrate handler when not prevented.
        -->
        <a
          href="#open"
          data-testid="trigger"
          use:trigger.action
          {...trigger.attrs}
          onclick={(e) => {
            consumerOnClick?.(e);
            if (consumerPreventsDefault) e.preventDefault();
            if (!e.defaultPrevented) trigger.attrs.onclick?.(e);
          }}
        >Open</a>
      {/snippet}
    </PopoverTrigger>
  {:else}
    <PopoverTrigger data-testid="trigger">Open</PopoverTrigger>
  {/if}
  <PopoverContent data-testid="content">Body</PopoverContent>
</Popover>
