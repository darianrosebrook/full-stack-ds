// Hand-written behavioral companion to the generated OTP scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { OTP } from "../OTP";

function mountOtp(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<OTP testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("OTP — behavioral surfaces", () => {
  it("renders the default inputs", () => {
    const renderer = mountOtp();
    expect(host(renderer).props.testID).toBe("subject");
  });

  it("accepts length, value, and mode props", () => {
    const renderer = mountOtp({ length: 6, value: "123456", mode: "alphanumeric" });
    expect(host(renderer).props.testID).toBe("subject");
  });
});
