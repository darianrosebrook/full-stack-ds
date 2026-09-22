import { html, render } from "lit";
import "@full-stack-ds/lit";
import type { SceneState, Store } from "../store";

const TAU = Math.PI * 2;

function view(state: SceneState, store: Store) {
  const phase = Math.round((((state.rotation % TAU) + TAU) % TAU) / TAU * 100);
  return html`
    <fsds-card data-testid="telemetry-card">
      <fsds-card-header>Telemetry · Lit</fsds-card-header>
      <fsds-card-content>
        <fsds-status status=${state.lampOn ? "success" : "warning"}>
          ${state.lampOn ? `Lamp on · ${state.colorTemp}` : "Lamp off"}
        </fsds-status>
        <fsds-progress
          data-testid="phase-progress"
          label="Rotation phase"
          .value=${phase}
          .showValue=${true}
        ></fsds-progress>
        <div class="telemetry-stats">
          <div>
            <small>Selected</small>
            <fsds-stat size="sm" data-testid="selected-stat">${state.selected ?? "—"}</fsds-stat>
          </div>
          <div>
            <small>Frame rate</small>
            <fsds-stat size="sm" trend="neutral">${state.fps} fps</fsds-stat>
          </div>
        </div>
        <fsds-button
          data-testid="clear-selection"
          variant="secondary"
          ?disabled=${state.selected === null}
          .onClick=${() => store.set({ selected: null })}
        >Clear selection</fsds-button>
      </fsds-card-content>
    </fsds-card>
  `;
}

/**
 * Lit re-renders on every store change. The store's `rotation` and `fps`
 * fields change every animation frame; the scene publishes them at a bounded
 * rate so this panel is not re-snapshotted and re-uploaded every frame.
 */
export function mountTelemetryPanel(host: HTMLElement, store: Store): void {
  const draw = (state: SceneState) => render(view(state, store), host);
  draw(store.get());
  store.subscribe(draw);
}
