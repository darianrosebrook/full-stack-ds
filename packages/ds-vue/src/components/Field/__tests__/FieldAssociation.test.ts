import { describe, expect, it } from "vitest";
import { h, type Component } from "vue";
import { mount } from "@vue/test-utils";
import Field from "../Field.vue";
import Input from "../../Input/Input.vue";

/**
 * FEAT-A11Y-LABEL-ID-ASSOCIATION-01 — end-to-end field association (Vue).
 *
 * Hand-authored (not generated): pins the cross-component mechanism — Field
 * provides the generated control id + describedby ids via provide/inject,
 * and a slotted Input binds them on its root element.
 */
describe("Field ↔ Input association", () => {
  it("wires label[for] → slotted input id through provide/inject", () => {
    const wrapper = mount(Field as Component, {
      props: { name: "email" },
      slots: {
        label: "Email address",
        control: () => h(Input as Component, { "data-testid": "control" }),
        help: "Help text.",
      },
    });
    const label = wrapper.find("label.field__label");
    const input = wrapper.find("input");
    const forId = label.attributes("for");
    expect(forId).toBeTruthy();
    expect(input.attributes("id")).toBe(forId);
  });

  it("delivers the help id to the control's aria-describedby while not invalid", () => {
    const wrapper = mount(Field as Component, {
      props: { name: "email" },
      slots: {
        label: "Email",
        control: () => h(Input as Component),
        help: "Help text.",
      },
    });
    const helpId = wrapper.find(".field__help").attributes("id");
    expect(helpId).toBeTruthy();
    expect(wrapper.find("input").attributes("aria-describedby")).toBe(helpId);
  });

  it("switches aria-describedby to the error id when status=invalid", () => {
    const wrapper = mount(Field as Component, {
      props: { name: "email", status: "invalid" },
      slots: {
        label: "Email",
        control: () => h(Input as Component),
        help: "Help text.",
        error: "That address is not valid.",
      },
    });
    const errorId = wrapper.find(".field__error").attributes("id");
    expect(errorId).toBeTruthy();
    expect(wrapper.find("input").attributes("aria-describedby")).toBe(errorId);
  });

  it("renders a standalone Input without generated ids (no provider)", () => {
    const wrapper = mount(Input as Component, {});
    expect(wrapper.find("input").attributes("id")).toBeUndefined();
    expect(
      wrapper.find("input").attributes("aria-describedby"),
    ).toBeUndefined();
  });
});
