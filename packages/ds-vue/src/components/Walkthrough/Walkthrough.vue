<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useWalkthrough } from "./useWalkthrough.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type WalkthroughStepSpec = { anchor: string; title: string; description?: string };
export type WalkthroughPlacement = "top" | "bottom" | "left" | "right" | "auto";
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
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  steps: () => ([{"anchor":"#step-1","title":"Welcome to the tour"},{"anchor":"#step-2","title":"Browse your dashboard"},{"anchor":"#step-3","title":"Configure preferences"}]),
  defaultIndex: 0,
  label: "Feature tour",
  autoStart: false,
  closeOnOutsideClick: false,
  placement: "auto",
});
// @generated:end

// @generated:start hook
const behavior = useWalkthrough({
  index: () => props.index,
  defaultIndex: props.defaultIndex,
  onStepChange: props.onStepChange,
  closeOnOutsideClick: props.closeOnOutsideClick,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "walkthrough",
  props.placement ? `walkthrough--${props.placement}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="status" :aria-label="props.label" :data-testid="props['data-testid']">
    <div :class="'walkthrough__content'">
      <h3 :class="'walkthrough__title'">
        <slot name="title" />
      </h3>
      <p :class="'walkthrough__description'">
        <slot name="description" />
      </p>
    </div>
    <div :class="'walkthrough__controls'">
      <button :class="'walkthrough__skip'" type="button"></button>
      <button :class="'walkthrough__prev'" type="button"></button>
      <div :class="'walkthrough__dots'">
        <button v-for="(item, index) in (props.steps ?? [])" :key="index" :class="'walkthrough__dot'" type="button" :aria-label="item.title" :data-step-index="index"></button>
      </div>
      <span :class="'walkthrough__counter'"></span>
      <button :class="'walkthrough__next'" type="button"></button>
    </div>
  </div>
</template>
