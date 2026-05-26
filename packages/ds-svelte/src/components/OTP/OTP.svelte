<script lang="ts">
// @generated:start imports
import { useOTP } from "./useOTP.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type OTPMode = "numeric" | "alphanumeric";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  mode?: OTPMode;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  class?: string;
}

let { length = 6, value, defaultValue, onChange, onComplete, mode = "numeric", disabled, readOnly, label = "One-time password", class: className }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useOTP({
  value: () => value,
  defaultValue: () => defaultValue,
  onChange: () => onChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "otp",
    mode ? `otp--${mode}` : null,
    disabled ? "otp--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} role="group" aria-label={label} aria-describedby="otp-error-id">
  <div class={'otp__group'}>
    {#each Array(length) as _, index (index)}
    <input class={'otp__field'} type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="1" disabled={disabled} aria-readonly={readOnly} data-otp-index={index} />
    {/each}
  </div>
</div>
