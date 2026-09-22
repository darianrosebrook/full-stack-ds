import { useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { Button, Card, CardContent, CardHeader, RadioGroup, Stack, Switch } from "@full-stack-ds/react";
import "@full-stack-ds/react/styles.css";
import type { ColorTemp, Store } from "../store";

const COLOR_OPTIONS: { value: ColorTemp; label: string }[] = [
  { value: "warm", label: "Warm 2700K" },
  { value: "cool", label: "Cool 6500K" },
  { value: "signal", label: "Signal red" },
];

function LightingPanel({ store }: { store: Store }) {
  const state = useSyncExternalStore(store.subscribe, store.get);
  return (
    <Card data-testid="lighting-card">
      <CardHeader>Lighting · React</CardHeader>
      <CardContent>
        <Stack variant="vertical">
          <Switch
            data-testid="lamp-switch"
            checked={state.lampOn}
            onChange={(lampOn) => store.set({ lampOn })}
          >
            Lamp
          </Switch>
          <RadioGroup
            name="color-temp"
            ariaLabel="Lamp colour"
            options={COLOR_OPTIONS}
            value={state.colorTemp}
            onChange={(value) => store.set({ colorTemp: value as ColorTemp })}
          />
          <Button
            data-testid="pulse-button"
            variant="secondary"
            disabled={!state.lampOn}
            onClick={() => store.set({ pulse: store.get().pulse + 1 })}
          >
            Pulse
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function mountLightingPanel(host: HTMLElement, store: Store): void {
  createRoot(host).render(<LightingPanel store={store} />);
}
