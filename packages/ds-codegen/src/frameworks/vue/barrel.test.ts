import { describe, expect, it } from "vitest";
import { generateVueBarrel } from "./barrel.js";

describe("generateVueBarrel", () => {
  it("emits component style imports before Vue component exports", () => {
    const source = generateVueBarrel(["Button", "Card"]);

    expect(source).toContain(`import "./Button/Button.css";`);
    expect(source).toContain(`export { default as Button } from "./Button/Button.vue";`);
    expect(source.indexOf(`import "./Button/Button.css";`)).toBeLessThan(
      source.indexOf(`export { default as Button }`),
    );
  });
});
