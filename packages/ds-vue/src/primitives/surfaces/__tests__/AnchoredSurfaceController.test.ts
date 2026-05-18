import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AnchoredSurfaceController } from "../AnchoredSurfaceController";

/**
 * Substrate-level boundary-focusout tests.
 *
 * Mirror of the React substrate tests added in F-3A atom A. The
 * Vue substrate now interprets `dismissal: ["blur"]` as boundary
 * semantics: dismiss when focus leaves the anchor ∪ content
 * surface. Tooltip behavior (non-focusable content) is preserved
 * because the content listener never fires when content has no
 * focusable descendants; Popover behavior (focusable content) is
 * what motivates the change.
 */
describe("AnchoredSurfaceController (Vue) — boundary focusout", () => {
  let anchor: HTMLButtonElement;
  let content: HTMLDivElement;
  let outsideButton: HTMLButtonElement;
  let contentInner: HTMLButtonElement;
  let openState = false;
  let setOpenSpy: ReturnType<typeof vi.fn>;
  let controller: AnchoredSurfaceController;

  beforeEach(() => {
    anchor = document.createElement("button");
    anchor.textContent = "anchor";
    document.body.appendChild(anchor);

    content = document.createElement("div");
    content.setAttribute("role", "tooltip");
    contentInner = document.createElement("button");
    contentInner.textContent = "inside content";
    content.appendChild(contentInner);
    document.body.appendChild(content);

    outsideButton = document.createElement("button");
    outsideButton.textContent = "outside";
    document.body.appendChild(outsideButton);

    openState = true;
    setOpenSpy = vi.fn((next: boolean) => {
      openState = next;
    });

    controller = new AnchoredSurfaceController({
      isOpen: () => openState,
      setOpen: setOpenSpy,
      openTriggers: [],
      dismissal: ["blur"],
    });
    controller.setAnchor(anchor);
    controller.setContent(content);
    controller.mount();
  });

  afterEach(() => {
    controller.unmount();
    anchor.remove();
    content.remove();
    outsideButton.remove();
  });

  function dispatchFocusOut(from: HTMLElement, to: EventTarget | null): void {
    const event = new FocusEvent("focusout", {
      bubbles: true,
      cancelable: false,
      relatedTarget: to as EventTarget,
    });
    from.dispatchEvent(event);
  }

  it("does NOT close when focus moves anchor → content", () => {
    dispatchFocusOut(anchor, contentInner);
    expect(setOpenSpy).not.toHaveBeenCalled();
  });

  it("does NOT close when focus moves content → anchor", () => {
    dispatchFocusOut(contentInner, anchor);
    expect(setOpenSpy).not.toHaveBeenCalled();
  });

  it("does NOT close when focus moves within content (descendant → descendant)", () => {
    const second = document.createElement("button");
    content.appendChild(second);
    dispatchFocusOut(contentInner, second);
    expect(setOpenSpy).not.toHaveBeenCalled();
    second.remove();
  });

  it("closes when focus moves anchor → outside", () => {
    dispatchFocusOut(anchor, outsideButton);
    expect(setOpenSpy).toHaveBeenCalledWith(false);
  });

  it("closes when focus moves content → outside", () => {
    dispatchFocusOut(contentInner, outsideButton);
    expect(setOpenSpy).toHaveBeenCalledWith(false);
  });

  it("closes when focus moves anchor → null (body / document)", () => {
    dispatchFocusOut(anchor, null);
    expect(setOpenSpy).toHaveBeenCalledWith(false);
  });

  it("closes when focus moves content → null", () => {
    dispatchFocusOut(contentInner, null);
    expect(setOpenSpy).toHaveBeenCalledWith(false);
  });

  it("does NOT close when the surface is already closed (isOpen guard absorbs teardown)", () => {
    openState = false;
    dispatchFocusOut(anchor, outsideButton);
    expect(setOpenSpy).not.toHaveBeenCalled();
  });

  it("removes the focusout listeners on unmount", () => {
    controller.unmount();
    dispatchFocusOut(anchor, outsideButton);
    expect(setOpenSpy).not.toHaveBeenCalled();
  });

  it("does not install focusout listeners when `blur` is not in dismissal", () => {
    controller.unmount();
    setOpenSpy.mockClear();
    const noBlurController = new AnchoredSurfaceController({
      isOpen: () => openState,
      setOpen: setOpenSpy,
      openTriggers: [],
      dismissal: ["escape"],
    });
    noBlurController.setAnchor(anchor);
    noBlurController.setContent(content);
    noBlurController.mount();
    dispatchFocusOut(anchor, outsideButton);
    expect(setOpenSpy).not.toHaveBeenCalled();
    noBlurController.unmount();
  });

  it("skips the anchor-side focusout listener in handlerMode (slot-host path)", () => {
    controller.unmount();
    setOpenSpy.mockClear();
    const handlerModeController = new AnchoredSurfaceController({
      isOpen: () => openState,
      setOpen: setOpenSpy,
      openTriggers: [],
      dismissal: ["blur"],
      handlerMode: true,
    });
    handlerModeController.setAnchor(anchor);
    handlerModeController.setContent(content);
    handlerModeController.mount();
    // anchor-side focusout is owned by the slot-host's onBlur via
    // triggerProps — substrate must not double-fire when blur happens
    // on the adopted element itself
    dispatchFocusOut(anchor, outsideButton);
    expect(setOpenSpy).not.toHaveBeenCalled();
    // but content-side focusout still closes (content is never adopted)
    dispatchFocusOut(contentInner, outsideButton);
    expect(setOpenSpy).toHaveBeenCalledWith(false);
    handlerModeController.unmount();
  });
});

describe("AnchoredSurfaceController (Vue) — boundary predicate with outside-click", () => {
  let anchor: HTMLButtonElement;
  let content: HTMLDivElement;
  let contentInner: HTMLSpanElement;
  let outsideButton: HTMLButtonElement;
  let setOpenSpy: ReturnType<typeof vi.fn>;
  let controller: AnchoredSurfaceController;

  beforeEach(() => {
    anchor = document.createElement("button");
    document.body.appendChild(anchor);
    content = document.createElement("div");
    contentInner = document.createElement("span");
    content.appendChild(contentInner);
    document.body.appendChild(content);
    outsideButton = document.createElement("button");
    document.body.appendChild(outsideButton);

    setOpenSpy = vi.fn();
    controller = new AnchoredSurfaceController({
      isOpen: () => true,
      setOpen: setOpenSpy,
      openTriggers: [],
      dismissal: ["outside-click"],
    });
    controller.setAnchor(anchor);
    controller.setContent(content);
    controller.mount();
  });

  afterEach(() => {
    controller.unmount();
    anchor.remove();
    content.remove();
    outsideButton.remove();
  });

  it("closes when mousedown fires on a node outside the surface", () => {
    outsideButton.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    );
    expect(setOpenSpy).toHaveBeenCalledWith(false);
  });

  it("does NOT close when mousedown fires inside the anchor", () => {
    anchor.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    );
    expect(setOpenSpy).not.toHaveBeenCalled();
  });

  it("does NOT close when mousedown fires inside the content", () => {
    contentInner.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    );
    expect(setOpenSpy).not.toHaveBeenCalled();
  });
});
