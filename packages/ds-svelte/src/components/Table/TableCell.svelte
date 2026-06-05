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
  colSpan?: number;
  rowSpan?: number;
}

let { class: className, "data-testid": dataTestid, children, id, style, colSpan, rowSpan }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(["table__cell", className].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<td class={classes} data-testid={dataTestid} {id} {style} colspan={colSpan} rowspan={rowSpan}>
  {@render children?.()}
</td>
