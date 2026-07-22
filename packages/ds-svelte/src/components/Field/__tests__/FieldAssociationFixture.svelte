<script lang="ts">
  // FEAT-A11Y-LABEL-ID-ASSOCIATION-01 test fixture: a Field with a real
  // Input in its control snippet, so the association test exercises the
  // provide/consume path exactly as a consumer would author it.
  import Field from "../Field.svelte";
  import Input from "../../Input/Input.svelte";

  let { status }: { status?: "idle" | "validating" | "valid" | "invalid" } =
    $props();
</script>

<Field name="email" {status}>
  {#snippet label()}Email address{/snippet}
  {#snippet control()}<Input />{/snippet}
  {#snippet help()}Help text.{/snippet}
  {#snippet error()}That address is not valid.{/snippet}
</Field>
