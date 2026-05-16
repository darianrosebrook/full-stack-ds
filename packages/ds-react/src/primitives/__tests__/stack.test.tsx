import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { createRef } from "react";
import { Stack } from "../stack";

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------
describe("Stack — unit", () => {
  it("renders a div by default", () => {
    render(<Stack data-testid="stack">hello</Stack>);
    const el = screen.getByTestId("stack");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveTextContent("hello");
  });

  it("applies vertical variant class by default", () => {
    render(<Stack data-testid="stack" />);
    expect(screen.getByTestId("stack")).toHaveClass("stack", "stack--vertical");
  });

  it("applies horizontal variant class", () => {
    render(<Stack data-testid="stack" variant="horizontal" />);
    expect(screen.getByTestId("stack")).toHaveClass(
      "stack",
      "stack--horizontal",
    );
  });

  it("merges custom className", () => {
    render(<Stack data-testid="stack" className="custom" />);
    const el = screen.getByTestId("stack");
    expect(el).toHaveClass("stack", "stack--vertical", "custom");
  });

  it("renders as a custom HTML element via `as`", () => {
    render(
      <Stack as="section" data-testid="stack">
        content
      </Stack>,
    );
    expect(screen.getByTestId("stack").tagName).toBe("SECTION");
  });

  it("renders as a ul and accepts li children", () => {
    render(
      <Stack as="ul" data-testid="list">
        <Stack as="li">item 1</Stack>
        <Stack as="li">item 2</Stack>
      </Stack>,
    );
    const list = screen.getByTestId("list");
    expect(list.tagName).toBe("UL");
    expect(list.querySelectorAll("li")).toHaveLength(2);
  });

  it("forwards HTML attributes to the root element", () => {
    render(
      <Stack data-testid="stack" id="my-stack" aria-label="a stack" />,
    );
    const el = screen.getByTestId("stack");
    expect(el).toHaveAttribute("id", "my-stack");
    expect(el).toHaveAttribute("aria-label", "a stack");
  });

  it("forwards a ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stack ref={ref} data-testid="stack" />);
    expect(ref.current).toBe(screen.getByTestId("stack"));
  });

  it("forwards event handlers", () => {
    let clicked = false;
    render(
      <Stack
        as="button"
        data-testid="btn"
        onClick={() => {
          clicked = true;
        }}
      >
        click
      </Stack>,
    );
    screen.getByTestId("btn").click();
    expect(clicked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Integration: Stack composed of Stacks
// ---------------------------------------------------------------------------
describe("Stack — integration (composition)", () => {
  it("nests stacks to form a card-like layout", () => {
    render(
      <Stack data-testid="card" variant="vertical">
        <Stack as="header" variant="horizontal" data-testid="card-header">
          <Stack as="span">Title</Stack>
          <Stack as="span">Icon</Stack>
        </Stack>
        <Stack data-testid="card-body">Body content</Stack>
      </Stack>,
    );

    const card = screen.getByTestId("card");
    const header = screen.getByTestId("card-header");
    const body = screen.getByTestId("card-body");

    expect(card).toContainElement(header);
    expect(card).toContainElement(body);
    expect(header.tagName).toBe("HEADER");
    expect(header).toHaveClass("stack--horizontal");
    expect(body).toHaveClass("stack--vertical");
  });

  it("composes a nav from nested stacks", () => {
    render(
      <Stack as="nav" variant="horizontal" data-testid="nav" aria-label="Main">
        <Stack as="a" href="/home">
          Home
        </Stack>
        <Stack as="a" href="/about">
          About
        </Stack>
      </Stack>,
    );

    const nav = screen.getByTestId("nav");
    expect(nav.tagName).toBe("NAV");
    expect(nav.querySelectorAll("a")).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------
describe("Stack — accessibility", () => {
  it("has no axe violations as a plain div", async () => {
    const { container } = render(<Stack>content</Stack>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations as a nav with links", async () => {
    const { container } = render(
      <Stack as="nav" aria-label="Primary">
        <Stack as="a" href="/one">
          One
        </Stack>
        <Stack as="a" href="/two">
          Two
        </Stack>
      </Stack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations as a list", async () => {
    const { container } = render(
      <Stack as="ul">
        <Stack as="li">Item 1</Stack>
        <Stack as="li">Item 2</Stack>
      </Stack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations as a button", async () => {
    const { container } = render(
      <Stack as="button" type="button">
        Click me
      </Stack>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
