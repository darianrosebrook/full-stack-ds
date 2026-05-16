<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  class?: string;
}

let { class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "slinky-cursor",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes}>
  <div class={'slinky-cursor__pest'}></div>
</div>
