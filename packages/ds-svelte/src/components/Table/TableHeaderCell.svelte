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
  scope?: "col" | "row" | "colgroup" | "rowgroup";
}

let { class: className, "data-testid": dataTestid, children, id, style, colSpan, rowSpan, scope }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(["table__headerCell", className].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<th class={classes} data-testid={dataTestid} {id} {style} colspan={colSpan} rowspan={rowSpan} {scope}>
  {@render children?.()}
</th>
