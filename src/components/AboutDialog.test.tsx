import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AboutDialog } from "./AboutDialog";

describe("AboutDialog", () => {
  it("uses tab semantics to switch between project context and commands", () => {
    render(<AboutDialog open onOpenChange={vi.fn()} />);

    const about = screen.getByRole("tab", { name: "About" });
    const commands = screen.getByRole("tab", { name: "Commands" });

    expect(about).toHaveAttribute("aria-selected", "true");
    expect(commands).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(
      "contract-governed design system",
    );

    fireEvent.click(commands);

    expect(commands).toHaveAttribute("aria-selected", "true");
    expect(about).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("pnpm run dev");
  });
});
