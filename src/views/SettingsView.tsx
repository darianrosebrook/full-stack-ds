import { useState } from "react";
import {
  Button,
  Checkbox,
  Field,
  Input,
  Label,
  OTP,
  Select,
  Sheet,
  Stack,
  TextField,
  Toast,
  ToggleSwitch,
} from "@full-stack-ds/react";
import {
  DEFAULT_PREFS,
  NAV_GROUPS,
  resetPrefs,
  setPrefs,
  usePrefs,
} from "../prefs";

const FRAMEWORK_OPTIONS = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "lit", label: "Lit" },
];

/** The reset code the OTP gate demands — visible in the UI (this is a local tool, not a bank). */
const RESET_CODE = "5-3-1";

/**
 * Real preferences surface: every control reads/writes the persisted prefs
 * store and takes effect app-wide (default framework, trace panel, preview
 * interactivity, visible nav groups). The destructive reset is gated behind
 * an OTP confirmation.
 */
export function SettingsView() {
  const prefs = usePrefs();
  const [saved, setSaved] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const [resetCode, setResetCode] = useState("");

  const notifySaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const hiddenGroups = NAV_GROUPS.filter((g) => !prefs.visibleNavGroups.includes(g));

  return (
    <div className="page">
      <p className="page-eyebrow">Preferences</p>
      <h1 className="page-title">Settings</h1>
      <p className="page-lede">
        These preferences persist to <code>localStorage</code> and take effect
        immediately across the showcase.
      </p>

      <section className="section" style={{ maxWidth: 640 }}>
        <Stack className="stack-gap-07">
          <Field
            name="settings-default-framework"
            slots={{
              label: <>Default framework tab</>,
              help: <>Developer tabs open on this framework first.</>,
              control: (
                <Select
                  id="settings-default-framework"
                  options={FRAMEWORK_OPTIONS}
                  value={prefs.defaultFramework}
                  onChange={(next) => {
                    setPrefs({ defaultFramework: next as string });
                    notifySaved();
                  }}
                  open={false}
                  onOpenChange={() => {}}
                />
              ),
            }}
          />

          <Stack as="label" variant="horizontal" className="stack-gap-05" style={{ justifyContent: "space-between", alignItems: "center", padding: "var(--fsds-core-spacing-size-04) 0" }}>
            <span>Show trace panel on component routes</span>
            <ToggleSwitch
              checked={prefs.tracePanelVisible}
              onChange={(checked) => {
                setPrefs({ tracePanelVisible: checked });
                notifySaved();
              }}
              size="small"
              ariaLabel="Show trace panel on component routes"
            />
          </Stack>

          <Stack as="label" variant="horizontal" className="stack-gap-05" style={{ justifyContent: "space-between", alignItems: "center", padding: "var(--fsds-core-spacing-size-04) 0" }}>
            <span>Previews interactive by default</span>
            <ToggleSwitch
              checked={prefs.interactivePreview}
              onChange={(checked) => {
                setPrefs({ interactivePreview: checked });
                notifySaved();
              }}
              size="small"
              ariaLabel="Previews interactive by default"
            />
          </Stack>

          <TextField
            defaultValue="⌘K"
            onChange={() => {}}
            slots={{
              label: <>Command palette hint</>,
              description: <>Cosmetic: the label shown beside the palette trigger.</>,
            }}
          />

          <Stack className="stack-gap-04">
            <Label>Visible nav groups</Label>
            <Stack className="stack-gap-03">
              {NAV_GROUPS.map((group) => (
                <label key={group} style={{ fontSize: "var(--fsds-core-typography-ramp-2)" }}>
                  <Checkbox
                    size="sm"
                    checked={prefs.visibleNavGroups.includes(group)}
                    onChange={(checked) => {
                      const next = checked
                        ? [...prefs.visibleNavGroups, group]
                        : prefs.visibleNavGroups.filter((g) => g !== group);
                      if (next.length === 0) return; // never hide every group
                      setPrefs({ visibleNavGroups: next });
                      notifySaved();
                    }}
                    name={`nav-group-${group}`}
                  />{" "}
                  {group}
                </label>
              ))}
            </Stack>
            <p className="muted" style={{ fontSize: "var(--fsds-core-typography-ramp-2)", margin: 0 }}>
              {hiddenGroups.length === 0
                ? "Every group is visible."
                : `Hidden: ${hiddenGroups.join(", ")}.`}
            </p>
          </Stack>

          <Stack className="stack-gap-04">
            <Label>Destructive — reset all preferences</Label>
            <div>
              <Button variant="secondary" size="small" onClick={() => setResetArmed(true)}>
                Reset all preferences…
              </Button>
            </div>
            {resetArmed && (
            <Sheet
              open
              onOpenChange={setResetArmed}
              side="right"
              slots={{
                title: "Reset all preferences",
                description: "This clears the local store and restores every default below.",
              }}
            >
              <ul className="muted" style={{ fontSize: "var(--fsds-core-typography-ramp-2)", paddingLeft: "var(--fsds-core-spacing-size-05)", margin: 0 }}>
                <li>Default framework → {DEFAULT_PREFS.defaultFramework}</li>
                <li>Trace panel → {DEFAULT_PREFS.tracePanelVisible ? "visible" : "hidden"}</li>
                <li>Interactive previews → {DEFAULT_PREFS.interactivePreview ? "on" : "off"}</li>
                <li>Nav groups → all visible</li>
              </ul>
              <p className="muted" style={{ fontSize: "var(--fsds-core-typography-ramp-2)" }}>
                Type <strong>{RESET_CODE}</strong> to confirm.
              </p>
              <OTP length={5} value={resetCode} onChange={setResetCode} mode="numeric" label="Reset confirmation code" />
              <Stack variant="horizontal" className="stack-gap-04">
                <Button
                  variant="primary"
                  size="small"
                  disabled={resetCode !== RESET_CODE.replace(/-/g, "")}
                  onClick={() => {
                    resetPrefs();
                    setResetArmed(false);
                    setResetCode("");
                    notifySaved();
                  }}
                >
                  Reset everything
                </Button>
                <Button variant="ghost" size="small" onClick={() => setResetArmed(false)}>
                  Cancel
                </Button>
              </Stack>
            </Sheet>
            )}
          </Stack>
        </Stack>
      </section>

      <Toast
        open={saved}
        onOpenChange={setSaved}
        title="Preferences saved"
        variant="success"
        duration={2500}
      >
        Stored locally — no account, no sync.
      </Toast>
    </div>
  );
}
