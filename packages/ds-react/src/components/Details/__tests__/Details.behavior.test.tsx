import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Details } from "../Details";

describe("Details activation", () => {
  it("reveals and removes children and reports each change once", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(<Details summary="More" onOpenChange={onOpenChange}><p>Matrix content</p></Details>);
    const root = container.querySelector("details")!;
    expect(root.open).toBe(false);
    expect(screen.queryByText("Matrix content")).not.toBeInTheDocument();
    await user.click(screen.getByText("More"));
    expect(root.open).toBe(true);
    expect(screen.getByText("Matrix content")).toBeVisible();
    expect(root).toHaveClass("details--open");
    expect(root.querySelector("summary")).toHaveAttribute("aria-controls", root.querySelector(".details__content")!.id);
    await user.click(screen.getByText("More"));
    expect(root.open).toBe(false);
    expect(screen.queryByText("Matrix content")).not.toBeInTheDocument();
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it.each([false, true])("keeps controlled open=%s authoritative until the parent changes it", async (open) => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container, rerender } = render(<Details summary="More" open={open} onOpenChange={onOpenChange}><p>Matrix content</p></Details>);
    const root = container.querySelector("details")!;
    await user.click(screen.getByText("More"));
    expect(root.open).toBe(open);
    expect(onOpenChange.mock.calls).toEqual([[!open]]);
    expect(screen.queryByText("Matrix content") !== null).toBe(open);
    rerender(<Details summary="More" open={!open} onOpenChange={onOpenChange}><p>Matrix content</p></Details>);
    expect(root.open).toBe(!open);
    expect(screen.queryByText("Matrix content") !== null).toBe(!open);
    expect(onOpenChange.mock.calls).toEqual([[!open]]);
  });

  it.each([false, true])("does not change disabled disclosures initially open=%s", async (defaultOpen) => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(<Details summary="More" defaultOpen={defaultOpen} disabled onOpenChange={onOpenChange}><p>Matrix content</p></Details>);
    await user.click(screen.getByText("More"));
    expect(container.querySelector("details")!.open).toBe(defaultOpen);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByText("Matrix content") !== null).toBe(defaultOpen);
  });
});
