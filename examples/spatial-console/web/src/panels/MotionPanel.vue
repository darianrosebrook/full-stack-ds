<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from "vue";
import { Button, Card, CardContent, CardHeader, RadioGroup, Stack, ToggleSwitch } from "@full-stack-ds/vue";
import type { Shape, Speed, Store } from "../store";

const props = defineProps<{ store: Store }>();

const state = shallowRef(props.store.get());
const unsubscribe = props.store.subscribe((next) => {
  state.value = next;
});
onBeforeUnmount(unsubscribe);

const shapeOptions: { value: Shape; label: string }[] = [
  { value: "torus", label: "Torus knot" },
  { value: "box", label: "Cube" },
  { value: "icosahedron", label: "Icosahedron" },
];
const speedOptions: { value: Speed; label: string }[] = [
  { value: "slow", label: "Slow" },
  { value: "medium", label: "Medium" },
  { value: "fast", label: "Fast" },
];
</script>

<template>
  <Card data-testid="motion-card">
    <CardHeader>Motion · Vue</CardHeader>
    <CardContent>
      <Stack variant="vertical">
        <Stack variant="horizontal">
          <ToggleSwitch
            data-testid="rotate-toggle"
            aria-label="Auto-rotate"
            :checked="state.autoRotate"
            :on-change="(autoRotate: boolean) => props.store.set({ autoRotate })"
          />
          <span>Auto-rotate</span>
        </Stack>
        <RadioGroup
          name="shape"
          aria-label="Object shape"
          orientation="horizontal"
          :options="shapeOptions"
          :value="state.shape"
          :on-change="(value: string) => props.store.set({ shape: value as Shape })"
        />
        <RadioGroup
          name="speed"
          aria-label="Rotation speed"
          orientation="horizontal"
          :options="speedOptions"
          :value="state.speed"
          :on-change="(value: string) => props.store.set({ speed: value as Speed })"
        />
        <Button
          data-testid="reset-button"
          variant="secondary"
          :on-click="() => props.store.set({ rotation: 0, selected: null })"
        >
          Reset object
        </Button>
      </Stack>
    </CardContent>
  </Card>
</template>
