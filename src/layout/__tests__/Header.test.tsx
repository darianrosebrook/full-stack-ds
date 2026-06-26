import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../Header";

describe("Header appearance popover", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-brand");
    document.documentElement.removeAttribute("data-theme");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    document.querySelectorAll("style[data-test-brand]").forEach((node) => node.remove());
    document.documentElement.removeAttribute("data-brand");
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
  });

  it("keeps label-based brand options interactive inside the popover", async () => {
    const style = document.createElement("style");
    style.dataset.testBrand = "true";
    style.textContent = `
      [data-brand="default"] { --test-brand: default; }
      [data-brand="canary"] { --test-brand: canary; }
    `;
    document.head.append(style);

    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole("button", { name: "Appearance settings" }));
    const canaryText = await screen.findByText("Canary");

    await user.click(canaryText);

    expect(screen.getByRole("button", { name: "Appearance settings" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await waitFor(() => expect(document.documentElement.dataset.brand).toBe("canary"));
    expect(screen.getByRole("radio", { name: "Canary" })).toBeChecked();
  });
});
