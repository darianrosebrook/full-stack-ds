// @generated:start imports
import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Popover } from "../Popover";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
function renderPopover(props: Partial<React.ComponentProps<typeof Popover>> = {}) {
  return render(
    <Popover {...props}>
      <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
      <Popover.Content data-testid="content">
        <button data-testid="content-button">action</button>
      </Popover.Content>
    </Popover>,
  );
}

describe("Popover — compound API surface", () => {
  it("renders the trigger but not the content when closed", () => {
    renderPopover();
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("renders the content when defaultOpen={true}", () => {
    renderPopover({ defaultOpen: true });
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("opens on click of the trigger", () => {
    renderPopover();
    const trigger = screen.getByTestId("trigger");
    act(() => {
      fireEvent.click(trigger);
    });
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("toggles closed on a second click of the trigger", () => {
    renderPopover({ defaultOpen: true });
    const trigger = screen.getByTestId("trigger");
    act(() => {
      fireEvent.click(trigger);
    });
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("closes on Escape", () => {
    renderPopover({ defaultOpen: true });
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("wires aria-controls + aria-expanded on the trigger", () => {
    renderPopover({ defaultOpen: true });
    const trigger = screen.getByTestId("trigger");
    const content = screen.getByTestId("content");
    const id = content.getAttribute("id");
    expect(id).toBeTruthy();
    expect(trigger).toHaveAttribute("aria-controls", id);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("aria-expanded reflects closed state", () => {
    renderPopover();
    const trigger = screen.getByTestId("trigger");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("fires onOpenChange on uncontrolled open", () => {
    const spy = vi.fn();
    renderPopover({ onOpenChange: spy });
    act(() => {
      fireEvent.click(screen.getByTestId("trigger"));
    });
    expect(spy).toHaveBeenCalledWith(true);
  });

  it("respects disabled — click does not open", () => {
    renderPopover({ disabled: true });
    act(() => {
      fireEvent.click(screen.getByTestId("trigger"));
    });
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("unmount removes document-level listeners (no setOpen after unmount)", () => {
    const spy = vi.fn();
    const { unmount } = renderPopover({ defaultOpen: true, onOpenChange: spy });
    unmount();
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("Popover — asChild adoption", () => {
  it("renders the adopted child as the actual host (no nested button)", () => {
    render(
      <Popover>
        <Popover.Trigger asChild>
          <a href="#open" data-testid="trigger">Open</a>
        </Popover.Trigger>
        <Popover.Content data-testid="content">Body</Popover.Content>
      </Popover>,
    );
    const trigger = screen.getByTestId("trigger");
    expect(trigger.tagName).toBe("A");
    expect(trigger.parentElement?.querySelector("button")).toBeNull();
  });

  it("default-host behavior is unchanged when asChild is absent", () => {
    renderPopover();
    expect(screen.getByTestId("trigger").tagName).toBe("BUTTON");
  });

  it("asChild opens on click over the adopted child", () => {
    render(
      <Popover>
        <Popover.Trigger asChild>
          <a href="#open" data-testid="trigger">Open</a>
        </Popover.Trigger>
        <Popover.Content data-testid="content">Body</Popover.Content>
      </Popover>,
    );
    act(() => {
      fireEvent.click(screen.getByTestId("trigger"));
    });
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("asChild — consumer event.preventDefault() suppresses the surface handler", () => {
    const surfaceSpy = vi.fn();
    render(
      <Popover onOpenChange={surfaceSpy}>
        <Popover.Trigger asChild>
          <a
            href="#open"
            data-testid="trigger"
            onClick={(e) => e.preventDefault()}
          >
            Open
          </a>
        </Popover.Trigger>
        <Popover.Content data-testid="content">Body</Popover.Content>
      </Popover>,
    );
    act(() => {
      fireEvent.click(screen.getByTestId("trigger"));
    });
    expect(surfaceSpy).not.toHaveBeenCalled();
    expect(screen.queryByTestId("content")).toBeNull();
  });

  it("asChild forwards the consumer's ref to the adopted DOM node", () => {
    const consumerRef = createRef<HTMLAnchorElement>();
    render(
      <Popover>
        <Popover.Trigger asChild>
          <a href="#open" data-testid="trigger" ref={consumerRef}>Open</a>
        </Popover.Trigger>
        <Popover.Content data-testid="content">Body</Popover.Content>
      </Popover>,
    );
    expect(consumerRef.current).not.toBeNull();
    expect(consumerRef.current?.tagName).toBe("A");
  });

  it("asChild applies the data-popover-trigger marker to the adopted host", () => {
    render(
      <Popover>
        <Popover.Trigger asChild>
          <a href="#open" data-testid="trigger">Open</a>
        </Popover.Trigger>
        <Popover.Content data-testid="content">Body</Popover.Content>
      </Popover>,
    );
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-popover-trigger");
  });
});

describe("Popover — accessibility", () => {
  it("has no unexpected axe violations when closed", async () => {
    const { container } = renderPopover();
    const results = (await axe(container)) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  it("has no unexpected axe violations when open", async () => {
    const { container } = renderPopover({ defaultOpen: true });
    const results = (await axe(container)) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
