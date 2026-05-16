<script lang="ts">
  interface Props {
    variant?: 'vertical' | 'horizontal';
    as?: keyof HTMLElementTagNameMap;
    role?: string;
    class?: string;
    'data-testid'?: string;
    children?: import('svelte').Snippet;
  }

  let {
    variant = 'vertical',
    as = 'div',
    role,
    class: className,
    'data-testid': dataTestid,
    children,
  }: Props = $props();

  const classes = $derived(
    ['FSDS-stack', `FSDS-stack--${variant}`, className].filter(Boolean).join(' ')
  );
</script>

<svelte:element this={as} class={classes} {role} data-testid={dataTestid}>
  {@render children?.()}
</svelte:element>
