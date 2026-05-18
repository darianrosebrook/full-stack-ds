<script lang="ts">
// Test fixture for Tooltip presence-surface compound.
import Tooltip from "../Tooltip.svelte";
import TooltipTrigger from "../TooltipTrigger.svelte";
import TooltipContent from "../TooltipContent.svelte";

interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  /** When true, render the asChild snippet adoption path. */
  asChild?: boolean;
  /** Spy invoked from the adopted child's onpointerenter handler.
   *  Used by the host-adoption tests to assert consumer handlers
   *  still run when composed with the substrate's handler. */
  consumerOnPointerEnter?: (event: PointerEvent) => void;
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
  asChild,
  consumerOnPointerEnter,
  consumerPreventsDefault,
}: Props = $props();
</script>

<Tooltip
  {open}
  {defaultOpen}
  {onOpenChange}
  {disabled}
  {closeOnEscape}
  {closeOnBlur}
>
  {#if asChild}
    <TooltipTrigger asChild>
      {#snippet child(trigger)}
        <!--
          Split binding via `trigger` (action + attrs).
          `use:trigger.action` owns DOM-node registration via
          Svelte's action lifecycle; `{...trigger.attrs}`
          carries ARIA, data marker, and Svelte event handlers
          via spread. Both are required — applying only one
          silently breaks the substrate.

          Consumer-handler composition: we run our own
          onpointerenter first, optionally call preventDefault,
          and only invoke the substrate's handler when not
          prevented. Mirrors the React asChild and Vue
          slot-props contracts.
        -->
        <a
          href="#help"
          data-testid="trigger"
          use:trigger.action
          {...trigger.attrs}
          onpointerenter={(e) => {
            consumerOnPointerEnter?.(e);
            if (consumerPreventsDefault) e.preventDefault();
            if (!e.defaultPrevented) trigger.attrs.onpointerenter?.(e);
          }}
        >Save</a>
      {/snippet}
    </TooltipTrigger>
  {:else}
    <TooltipTrigger data-testid="trigger">Save</TooltipTrigger>
  {/if}
  <TooltipContent data-testid="content">Help text</TooltipContent>
</Tooltip>
