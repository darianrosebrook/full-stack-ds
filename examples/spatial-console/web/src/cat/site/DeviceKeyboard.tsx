import { useEffect, useState } from "react";

// An on-screen keyboard for the tablet and phone. It slides up while a text
// field has focus and away when the field blurs, like a device keyboard.
//
// App-layer, not the DS Sheet: Sheet always traps focus (its `modal` prop is
// not read), and a keyboard must leave focus in the field it types into.
// Keys never take focus: pointerdown is cancelled so the field keeps it.

const ROWS: { key: string; code: string; label?: string; grow?: number }[][] = [
  [..."qwertyuiop"].map((k) => ({ key: k, code: `Key${k.toUpperCase()}` })),
  [..."asdfghjkl"].map((k) => ({ key: k, code: `Key${k.toUpperCase()}` })),
  [
    ...[..."zxcvbnm"].map((k) => ({ key: k, code: `Key${k.toUpperCase()}` })),
    { key: "Backspace", code: "Backspace", label: "⌫", grow: 1.5 },
  ],
  [
    { key: ",", code: "Comma" },
    { key: " ", code: "Space", label: "space", grow: 6 },
    { key: ".", code: "Period" },
  ],
];

function isTextField(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement {
  return (el instanceof HTMLInputElement && /^(text|search|email|url|tel|password)$/.test(el.type)) || el instanceof HTMLTextAreaElement;
}

/** Type into a React-controlled field the way a real keypress would. */
function typeInto(field: HTMLInputElement | HTMLTextAreaElement, key: string) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  const before = field.value.slice(0, key === "Backspace" && start === end ? Math.max(0, start - 1) : start);
  const next = key === "Backspace" ? before + field.value.slice(end) : before + key + field.value.slice(end);
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), "value")!.set!;
  setter.call(field, next);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  const caret = before.length + (key === "Backspace" ? 0 : key.length);
  field.setSelectionRange(caret, caret);
}

export function DeviceKeyboard() {
  const [field, setField] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => setField(isTextField(e.target as Element) ? (e.target as HTMLInputElement) : null);
    const onFocusOut = (e: FocusEvent) => {
      if (!isTextField(e.relatedTarget as Element | null)) setField(null);
    };
    // A hardware key flashes its on-screen twin, so a paw tap has a target.
    let timer = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      setPressed(e.code);
      clearTimeout(timer);
      timer = window.setTimeout(() => setPressed(null), 140);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="device-keyboard" data-device-keyboard data-open={field ? "" : undefined} aria-hidden="true">
      {ROWS.map((row, i) => (
        <div className="device-keyboard__row" key={i}>
          {row.map((k) => (
            <span
              key={k.code}
              className="device-keyboard__key"
              data-key-code={k.code}
              data-pressed={pressed === k.code ? "" : undefined}
              style={k.grow ? { flexGrow: k.grow } : undefined}
              onPointerDown={(e) => {
                e.preventDefault();
                if (field) typeInto(field, k.key);
              }}
            >
              {k.label ?? k.key}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
