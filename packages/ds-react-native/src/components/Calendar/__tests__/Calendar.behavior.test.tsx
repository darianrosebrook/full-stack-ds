// Hand-written behavioral companion to the generated Calendar scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestInstance, type ReactTestRenderer } from "react-test-renderer";
import { Calendar } from "../Calendar";

const D1 = new Date(2026, 8, 1);
const D2 = new Date(2026, 8, 2);
const D3 = new Date(2026, 8, 3);

function mountCalendar(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(
      <Calendar days={[D1, D2, D3]} testID="subject" {...props} />,
    );
  });
  return renderer!;
}

/**
 * Day cells are the only pressable buttons in the lowered tree. Match host
 * instances only (string type) — the test shim renders a component that wraps
 * a same-named host, and both carry identical props.
 */
const dayPressables = (r: ReactTestRenderer): ReactTestInstance[] =>
  r.root.findAll(
    (n) =>
      String(n.type) === "Pressable" &&
      typeof n.props.onPress === "function" &&
      n.props.accessibilityRole === "button",
  );

const selectedStates = (r: ReactTestRenderer) =>
  dayPressables(r).map((n) => n.props.accessibilityState.selected as boolean);

describe("Calendar — behavioral surfaces", () => {
  it("marks each tapped day selected and reports its date through onChange", () => {
    const reported: unknown[] = [];
    const renderer = mountCalendar({
      onChange: (next: unknown) => reported.push(next),
    });
    const pressed: ReactTestInstance[] = [];
    for (const node of dayPressables(renderer)) {
      act(() => node.props.onPress());
      pressed.push(node);
    }
    // Each day node carries a distinct iterated date, so pressing all of
    // them reports all three dates exactly once.
    expect(new Set(reported)).toEqual(new Set([D1, D2, D3]));
    // Uncontrolled mode: only the last-pressed day stays selected.
    const stillSelected = dayPressables(renderer).filter(
      (n) => n.props.accessibilityState.selected,
    );
    expect(stillSelected.length).toBe(1);
    expect(stillSelected[0]).toBe(pressed.at(-1));
  });

  it("applies the selected style to exactly the selected day", () => {
    const renderer = mountCalendar({ value: D2 });
    const states = dayPressables(renderer).map((n) => ({
      selected: n.props.accessibilityState.selected as boolean,
      selectedStyle: (n.props.style as unknown[]).at(-1),
    }));
    const chosen = states.filter((s) => s.selected);
    expect(chosen.length).toBe(1);
    expect(chosen[0]!.selectedStyle).toEqual({ backgroundColor: "#d92d2e" });
    for (const other of states.filter((s) => !s.selected)) {
      expect(other.selectedStyle).toBeUndefined();
    }
  });

  it("keeps a controlled selection pinned while still reporting presses", () => {
    let reported: unknown;
    const renderer = mountCalendar({
      value: D2,
      onChange: (next: unknown) => (reported = next),
    });
    const selectedNode = dayPressables(renderer).find(
      (n) => n.props.accessibilityState.selected,
    )!;
    const unselectedNode = dayPressables(renderer).find(
      (n) => !n.props.accessibilityState.selected,
    )!;
    // The selected node carries D2 as its iterated item, so pressing it can
    // only ever report D2; the selection itself stays pinned by the prop.
    act(() => selectedNode.props.onPress());
    expect(reported).toBe(D2);
    expect(selectedNode.props.accessibilityState.selected).toBe(true);
    expect(unselectedNode.props.accessibilityState.selected).toBe(false);
  });

  it("selects every date of a range value", () => {
    const renderer = mountCalendar({ value: [D1, D3] });
    expect(selectedStates(renderer).filter(Boolean).length).toBe(2);
  });
});
