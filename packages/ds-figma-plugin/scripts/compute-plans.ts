// Build-time helper: compute the 6 fixture plans via the REAL planner and stash
// them on globalThis so build-live-inject.mjs can read them after bundling.
import { planFigmaStateSurface } from "../src/planner.js";
import Button from "../src/generated/components/Button/Button.figma.json";
import Checkbox from "../src/generated/components/Checkbox/Checkbox.figma.json";
import Switch from "../src/generated/components/Switch/Switch.figma.json";
import Dialog from "../src/generated/components/Dialog/Dialog.figma.json";
import Sheet from "../src/generated/components/Sheet/Sheet.figma.json";
import Tabs from "../src/generated/components/Tabs/Tabs.figma.json";

const fixtures = [Button, Checkbox, Switch, Dialog, Sheet, Tabs];
(globalThis as unknown as { __fsdsPlans: unknown }).__fsdsPlans = fixtures.map((d) =>
  planFigmaStateSurface(d as never),
);
