import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it, vi } from "vitest";
import { buildComponentIR } from "../ir.js";
import { selectionChangeHandler } from "./selection-dismissal.js";

it("honors dismissal defaults, explicit cancellation and multiple selection", () => {
  const contract = JSON.parse(readFileSync(resolve(__dirname, "../../../ds-contracts/components/Select/Select.contract.json"), "utf8"));
  const ir = buildComponentIR(contract);
  const policy = ir.behavior.normalizedDismissalTriggers.find(t => t.event === "selection")!;
  policy.enabledByProp = "closeOnSelect";
  const source = selectionChangeHandler(ir, "selection", "notify", name => `props.${name}()`, "close()", "focus()", name => `props.${name}`)!;
  const notify = vi.fn(), close = vi.fn(), focus = vi.fn();
  const handler = (multiple: boolean, closeOnSelect?: boolean) => new Function("props", "notify", "close", "focus", "requestAnimationFrame", `return ${source}`)(
    { multiple: () => multiple, closeOnSelect }, notify, close, focus, (callback: () => void) => callback(),
  );
  handler(false, false)("red");
  handler(true, true)(["red"]);
  expect(notify).toHaveBeenCalledTimes(2);
  expect(close).not.toHaveBeenCalled();
  handler(false)("blue");
  expect(close).toHaveBeenCalledOnce();
  expect(focus).toHaveBeenCalledOnce();
  policy.defaultEnabled = false;
  delete policy.enabledByProp;
  expect(selectionChangeHandler(ir, "selection", "notify", name => name, "close()", "focus()")).toBeUndefined();
});
