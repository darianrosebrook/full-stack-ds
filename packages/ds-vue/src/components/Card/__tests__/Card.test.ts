// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Card from "../Card.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Card — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("card");
  });

  it("merges custom class", () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("card");
    expect(wrapper.classes()).toContain("custom");
  });

  it("forwards data-testid to the rendered element", () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card" }, slots: { "default": "content" } });
    expect(wrapper.find('[data-testid="card"]').exists()).toBe(true);
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card" }, slots: { "default": "content" } });
    expect(wrapper.attributes("role")).toBe("group");
  });

  it("applies density=default variant class", () => {
    const wrapper = mount(Card as Component, { props: { "density": "default" }, attrs: { "data-testid": "card" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("card--default");
  });

  it("applies density=inset variant class", () => {
    const wrapper = mount(Card as Component, { props: { "density": "inset" }, attrs: { "data-testid": "card" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("card--inset");
  });
});

describe("Card — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card", "aria-label": "Test Card" }, slots: { "default": "content" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import { defineComponent, h } from "vue";
import CardContent from "../CardContent.vue";
import CardDescription from "../CardDescription.vue";
import CardFooter from "../CardFooter.vue";
import CardHeader from "../CardHeader.vue";


describe("Card — compound parts", () => {
  it("mounts CardContent with tag, base class, and slot content", () => {
    const wrapper = mount(CardContent as Component, {
      slots: { default: "Card part" },
      attrs: { "data-testid": "card-cardcontent" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
    expect(wrapper.classes()).toContain("card__content");
    expect(wrapper.text()).toContain("Card part");
  });

  it("mounts CardDescription with tag, base class, and slot content", () => {
    const wrapper = mount(CardDescription as Component, {
      slots: { default: "Card part" },
      attrs: { "data-testid": "card-carddescription" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("p");
    expect(wrapper.classes()).toContain("card__description");
    expect(wrapper.text()).toContain("Card part");
  });

  it("mounts CardFooter with tag, base class, and slot content", () => {
    const wrapper = mount(CardFooter as Component, {
      slots: { default: "Card part" },
      attrs: { "data-testid": "card-cardfooter" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
    expect(wrapper.classes()).toContain("card__footer");
    expect(wrapper.text()).toContain("Card part");
  });

  it("mounts CardHeader with tag, base class, and slot content", () => {
    const wrapper = mount(CardHeader as Component, {
      slots: { default: "Card part" },
      attrs: { "data-testid": "card-cardheader" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
    expect(wrapper.classes()).toContain("card__header");
    expect(wrapper.text()).toContain("Card part");
  });
});

describe("Card — landmarks", () => {
  // A card's header and footer belong to the card, not the page: two cards
  // on one page must not contribute two banner/contentinfo landmarks.
  it("exposes no banner or contentinfo landmark for two cards with headers and footers", async () => {
    const card = (label: string) =>
      h(Card as Component, { "aria-label": label }, {
        default: () => [
          h(CardHeader as Component, null, { default: () => label }),
          h(CardContent as Component, null, { default: () => "Body" }),
          h(CardFooter as Component, null, { default: () => "Foot" }),
        ],
      });
    const wrapper = mount(defineComponent({ render: () => h("div", [card("First"), card("Second")]) }), { attachTo: document.body });
    try {
      expect(wrapper.findAll(".card__header")).toHaveLength(2);
      expect(wrapper.element.querySelectorAll("header, footer, [role='banner'], [role='contentinfo']")).toHaveLength(0);
      const results = await axe(document.documentElement, { runOnly: ["landmark-no-duplicate-banner", "landmark-no-duplicate-contentinfo", "landmark-banner-is-top-level", "landmark-contentinfo-is-top-level"] });
      expect(results.violations.map((v) => v.id)).toEqual([]);
    } finally {
      wrapper.unmount();
    }
  });
});
// @custom:end
