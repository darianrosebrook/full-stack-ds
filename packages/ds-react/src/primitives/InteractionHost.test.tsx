import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InteractionHost } from "./InteractionHost";

describe("InteractionHost", () => {
  it("composes nested activation, consumer handlers, refs and cleanup on one host", () => {
    const order: string[] = [];
    const innerRef = createRef<HTMLButtonElement>();
    const outerRef = createRef<HTMLElement>();
    const cleanup = vi.fn();
    const callback = vi.fn(() => cleanup);
    const tree = <InteractionHost asChild ref={outerRef} onActivate={() => order.push("outer")}>
      <InteractionHost asChild ref={callback} onActivate={() => order.push("inner")}>
        <button ref={innerRef} onClick={() => order.push("consumer")}>Activate</button>
      </InteractionHost>
    </InteractionHost>;
    const result = render(tree);
    const button = screen.getByRole("button", { name: "Activate" });
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(innerRef.current).toBe(button);
    expect(outerRef.current).toBe(button);
    fireEvent.click(button);
    expect(order).toEqual(["consumer", "outer", "inner"]);
    result.rerender(tree);
    expect(cleanup).not.toHaveBeenCalled();
    result.unmount();
    expect(innerRef.current).toBeNull();
    expect(outerRef.current).toBeNull();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("lets the consumer cancel activation and preserves descriptive idrefs", () => {
    const activate = vi.fn();
    render(<InteractionHost asChild aria-describedby="binding-help" onActivate={activate}>
      <button aria-describedby="consumer-help" onClick={event => event.preventDefault()}>Cancel</button>
    </InteractionHost>);
    const button = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(button);
    expect(activate).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("aria-describedby", "consumer-help binding-help");
  });

  it("preserves disabled semantics supplied by the adopted child", () => {
    const activate = vi.fn();
    render(<InteractionHost asChild disabled={false} onActivate={activate}><button disabled>Unavailable</button></InteractionHost>);
    const button = screen.getByRole("button", { name: "Unavailable" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(activate).not.toHaveBeenCalled();
  });

  it("rejects fragments and more than one host", () => {
    expect(() => render(<InteractionHost asChild><><button>A</button></></InteractionHost>)).toThrow(/one element/);
    expect(() => render(<InteractionHost asChild><button>A</button><button>B</button></InteractionHost>)).toThrow(/exactly one/);
  });
});
