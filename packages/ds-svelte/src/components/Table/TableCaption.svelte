<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  class?: string;
  "data-testid"?: string;
  children?: import('svelte').Snippet;
  id?: string;
  style?: string;
}

let { class: className, "data-testid": dataTestid, children, id, style }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(["table__caption", className].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<caption class={classes} data-testid={dataTestid} {id} {style}>
  {@render children?.()}
</caption>
