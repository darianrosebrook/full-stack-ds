import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Button, Input } from "@full-stack-ds/react";
import { JsonTreeViewer } from "./JsonTreeViewer";
import { PropertySection } from "./properties-panel/PropertySection";
import { TokenValueControl } from "./properties-panel/TokenValueControl";

describe("generated showcase compositions", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("keeps section actions independent and hides collapsed controls", () => {
    const action = vi.fn();
    render(<PropertySection title="Dimensions" action={<Button onClick={action}>Add dimension</Button>}>
      <Input ariaLabel="Width" defaultValue="8px" />
    </PropertySection>);
    const trigger = screen.getByRole("button", { name: "Dimensions" });
    expect(trigger.closest('[data-fsds-component="accordion"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Add dimension" }));
    expect(action).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("textbox", { name: "Width" })).toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByRole("textbox", { name: "Width" })).toHaveValue("8px");
  });

  it("reveals array trace ancestors and respects manual collapse until selection changes", async () => {
    const value = { tree: { items: [{ value: "first" }, { value: "second" }] } };
    const { container, rerender } = render(<JsonTreeViewer value={value} />);
    expect(screen.queryByText('"second"')).toBeNull();
    rerender(<JsonTreeViewer value={value} highlightPath="tree.items[1].value" />);
    expect(await screen.findByText('"second"')).toBeVisible();
    expect(screen.queryByText('"first"')).toBeNull();
    expect(container.querySelectorAll('details:not([data-fsds-component="details"])')).toHaveLength(0);
    fireEvent.click(screen.getByText("Array(2)"));
    expect(screen.queryByText('"second"')).toBeNull();
    rerender(<JsonTreeViewer value={value} highlightPath="tree.items[0].value" />);
    expect(await screen.findByText('"first"')).toBeVisible();
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled());
  });

  it("edits literals, disables invalid stepping, filters tokens and commits a binding", async () => {
    function Editor() {
      const [value, setValue] = useState("8px");
      return <TokenValueControl value={value} linked={false} kind="dimension" label="width"
        title="Width" onChange={setValue} onBindToken={(pick) => setValue(pick.value)}
        foundationTokens={[
          { layer: "semantic", path: "spacing.roomy", type: "dimension", value: "24px" },
          { layer: "core", path: "spacing.small", type: "dimension", value: "4px" },
          { layer: "core", path: "color.red", type: "color", value: "#ff0000" },
        ]} />;
    }
    render(<Editor />);
    const trigger = screen.getByRole("button", { name: "Edit width" });
    expect(trigger).toHaveAttribute("data-fsds-component", "button");
    fireEvent.click(trigger);
    const literal = await screen.findByRole("textbox", { name: "width value" });
    expect(literal).toHaveAttribute("data-fsds-component", "input");
    fireEvent.click(screen.getByRole("button", { name: "Increase width" }));
    expect(literal).toHaveValue("9px");
    fireEvent.change(literal, { target: { value: "auto" } });
    expect(screen.getByRole("button", { name: "Decrease width" })).toBeDisabled();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search tokens" }), { target: { value: "roomy" } });
    expect(screen.queryByRole("button", { name: /spacing.small/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /color.red/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /spacing.roomy/ }));
    await waitFor(() => expect(screen.queryByRole("textbox", { name: "width value" })).toBeNull());
    expect(trigger).toHaveTextContent("24px");
  });
});
