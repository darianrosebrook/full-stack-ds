import { afterEach, expect, it } from "vitest";
import { CodeBlockElement } from "../CodeBlock";

afterEach(() => document.body.replaceChildren());

it("switches between literal source and supplied content as the slot changes", async () => {
  const element = new CodeBlockElement();
  element.code = "<literal>\n  source";
  element.language = "plaintext";
  document.body.append(element);
  const settle = async () => {
    await Promise.resolve();
    await element.updateComplete;
    await Promise.resolve();
    await element.updateComplete;
  };
  await settle();
  expect(element.shadowRoot?.querySelector("code")?.textContent).toBe("<literal>\n  source");
  const annotation = document.createElement("span");
  annotation.textContent = "Annotated source";
  element.append(annotation);
  await settle();
  expect(element.shadowRoot?.querySelector(".code-block__source")).toBeNull();
  expect(element.shadowRoot?.querySelector("slot")?.assignedElements()).toEqual([annotation]);
  annotation.remove();
  await settle();
  expect(element.shadowRoot?.querySelector("code")?.textContent).toBe("<literal>\n  source");
});
