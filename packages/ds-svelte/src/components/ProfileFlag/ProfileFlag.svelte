<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type ProfileFlagData = { id: string; username: string; full_name: string; first_name: string | null; last_name: string | null; avatar_url: string | null; bio: string; occupation: string | null; account_status: string; created_at: string; updated_at: string | null };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  profile?: ProfileFlagData;
  class?: string;
  children?: import('svelte').Snippet;
}

let { profile, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "profile-flag",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes}>
  {@render children?.()}
</div>
