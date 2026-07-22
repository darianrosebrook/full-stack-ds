<script lang="ts">
// @generated:start imports
import { useWalkthrough } from "./useWalkthrough.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type WalkthroughStepSpec = { anchor: string; title: string; description?: string };
type WalkthroughPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  steps?: WalkthroughStepSpec[];
  index?: number;
  defaultIndex?: number;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  label?: string;
  storageKey?: string;
  autoStart?: boolean;
  closeOnOutsideClick?: boolean;
  placement?: WalkthroughPlacement;
  class?: string;
  description?: import('svelte').Snippet;
  title?: import('svelte').Snippet;
}

let { steps = [{"anchor":"#step-1","title":"Welcome to the tour"},{"anchor":"#step-2","title":"Browse your dashboard"},{"anchor":"#step-3","title":"Configure preferences"}], index, defaultIndex = 0, onStepChange, onComplete, onSkip, label = "Feature tour", storageKey, autoStart = false, closeOnOutsideClick = false, placement = "auto", class: className, description, title }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useWalkthrough({
  index: () => index,
  defaultIndex: () => defaultIndex,
  onStepChange: () => onStepChange,
  closeOnOutsideClick: () => closeOnOutsideClick,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "walkthrough",
    placement ? `walkthrough--${placement}` : null,
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

<div class={classes} role="status" aria-label={label}>
  <div class={'walkthrough__content'} aria-labelledby={title ? `${instanceId}-title` : undefined} aria-describedby={description ? `${instanceId}-description` : undefined}>
    <h3 class={'walkthrough__title'} id={`${instanceId}-title`}>
      {@render title?.()}
    </h3>
    <p class={'walkthrough__description'} id={`${instanceId}-description`}>
      {@render description?.()}
    </p>
  </div>
  <div class={'walkthrough__controls'}>
    <button class={'walkthrough__skip'} type="button"></button>
    <button class={'walkthrough__prev'} type="button"></button>
    <div class={'walkthrough__dots'}>
      {#each (steps ?? []) as item, index (index)}
      <button class={'walkthrough__dot'} type="button" aria-label={item.title} data-step-index={index}></button>
      {/each}
    </div>
    <span class={'walkthrough__counter'}></span>
    <button class={'walkthrough__next'} type="button"></button>
  </div>
</div>
