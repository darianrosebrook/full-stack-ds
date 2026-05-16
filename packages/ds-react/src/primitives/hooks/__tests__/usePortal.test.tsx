import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { usePortal } from "../usePortal";

function Demo({
  enabled = true,
  target,
}: {
  enabled?: boolean;
  target?: Element | string;
}) {
  const portal = usePortal({ enabled, target });
  return (
    <div data-testid="origin">
      origin
      {portal.render(<div data-testid="ported">ported</div>)}
    </div>
  );
}

describe("usePortal", () => {
  it("mounts ported children to document.body by default", () => {
    const { getByTestId } = render(<Demo />);
    const origin = getByTestId("origin");
    const ported = getByTestId("ported");
    expect(origin.contains(ported)).toBe(false);
    expect(document.body.contains(ported)).toBe(true);
  });

  it("renders inline when enabled is false", () => {
    const { getByTestId } = render(<Demo enabled={false} />);
    const origin = getByTestId("origin");
    const ported = getByTestId("ported");
    expect(origin.contains(ported)).toBe(true);
  });

  it("respects a target element", () => {
    const target = document.createElement("section");
    document.body.appendChild(target);
    const { getByTestId } = render(<Demo target={target} />);
    expect(target.contains(getByTestId("ported"))).toBe(true);
    document.body.removeChild(target);
  });

  it("respects a CSS selector target", () => {
    const target = document.createElement("aside");
    target.id = "portal-target";
    document.body.appendChild(target);
    const { getByTestId } = render(<Demo target="#portal-target" />);
    expect(target.contains(getByTestId("ported"))).toBe(true);
    document.body.removeChild(target);
  });
});
