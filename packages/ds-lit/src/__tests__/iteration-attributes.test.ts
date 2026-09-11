import { afterEach, expect, it } from "vitest";
import { RadioGroupElement } from "../components/RadioGroup/RadioGroup";
import { SelectElement } from "../components/Select/Select";

afterEach(() => document.body.replaceChildren());

it("omits absent radio metadata, preserves false, and removes stale fields after updates", async () => {
  const group = new RadioGroupElement();
  group.name = "choices";
  group.options = [
    { value: "a", label: "A" },
    { value: "b", label: "B", disabled: false, description: "Available" },
    { value: "c", label: "C", disabled: true },
  ];
  document.body.append(group);
  await group.updateComplete;
  const labels = () => Array.from(group.shadowRoot!.querySelectorAll("label"));
  expect(labels().map(node => node.getAttribute("data-disabled"))).toEqual([null, "false", "true"]);
  expect(labels().map(node => node.getAttribute("title"))).toEqual([null, "Available", null]);
  group.options = group.options.map(({ value, label }) => ({ value, label }));
  await group.updateComplete;
  expect(labels().map(node => node.getAttribute("data-disabled"))).toEqual([null, null, null]);
  expect(labels().map(node => node.getAttribute("title"))).toEqual([null, null, null]);
});

it("keeps absent and explicitly false option disability distinct from true", async () => {
  const select = new SelectElement();
  select.open = true;
  select.options = [
    { value: "a", label: "A" },
    { value: "b", label: "B", disabled: false },
    { value: "c", label: "C", disabled: true },
  ];
  document.body.append(select);
  await select.updateComplete;
  const options = Array.from(select.shadowRoot!.querySelectorAll<HTMLButtonElement>('button[role="option"]'));
  expect(options.map(node => node.getAttribute("aria-disabled"))).toEqual([null, "false", "true"]);
  expect(options.map(node => node.disabled)).toEqual([false, false, true]);
});
