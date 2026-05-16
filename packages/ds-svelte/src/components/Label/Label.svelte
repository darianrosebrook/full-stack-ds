<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  htmlFor?: string;
  form?: string;
  class?: string;
  children?: import('svelte').Snippet;
}

let { htmlFor, form, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "label",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<label class={classes} for={htmlFor} form={form}>
  {@render children?.()}
</label>
