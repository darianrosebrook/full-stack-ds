import { createApp } from "vue";
import "@full-stack-ds/vue/styles.css";
import MotionPanel from "./MotionPanel.vue";
import type { Store } from "../store";

export function mountMotionPanel(host: HTMLElement, store: Store): void {
  createApp(MotionPanel, { store }).mount(host);
}
