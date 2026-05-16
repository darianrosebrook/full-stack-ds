import { onMount } from 'svelte';

let lockCount = 0;
let savedOverflow = '';

function acquire() {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

function release() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.body.style.overflow = savedOverflow;
}

export function createScrollLock(getActive: () => boolean): void {
  let held = false;

  $effect(() => {
    const active = getActive();
    if (active && !held) {
      acquire();
      held = true;
    } else if (!active && held) {
      release();
      held = false;
    }
  });

  onMount(() => () => {
    if (held) {
      release();
      held = false;
    }
  });
}
