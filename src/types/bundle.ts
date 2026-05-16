// @ts-expect-error - virtual module provided by vite-plugin-fsds-data
import rawBundle from "virtual:fsds/data";
import type { Bundle } from "./data";

export const bundle = rawBundle as Bundle;
export type { Bundle };
