import type { TokenDefinition } from "../../types/data";

interface TokensTableProps {
  tokens: Record<string, TokenDefinition>;
}

interface TokenEntry {
  slot: string;
  definition: TokenDefinition;
}

const GROUP_ORDER = [
  "box-model",
  "color",
  "size",
  "typography",
  "motion",
  "other",
] as const;

const GROUP_LABEL: Record<(typeof GROUP_ORDER)[number], string> = {
  "box-model": "Box model",
  color: "Color",
  size: "Size",
  typography: "Typography",
  motion: "Motion",
  other: "Other",
};

function groupKey(slot: string): (typeof GROUP_ORDER)[number] {
  if (slot.startsWith("box-model.")) return "box-model";
  if (slot.includes(".color.")) return "color";
  if (slot.includes(".size.")) return "size";
  if (slot.includes(".text.") || slot.includes(".typography."))
    return "typography";
  if (slot.includes(".motion.")) return "motion";
  return "other";
}

function isColorish(val: string | undefined): boolean {
  if (!val) return false;
  return /^#|^rgb|^hsl|^var\(/.test(val);
}

function cssVarForSlot(slot: string): string {
  return `--fsds-${slot.replace(/\./g, "-")}`;
}

export function TokensTable({ tokens }: TokensTableProps) {
  const groups = new Map<(typeof GROUP_ORDER)[number], TokenEntry[]>();
  for (const [slot, definition] of Object.entries(tokens)) {
    const key = groupKey(slot);
    groups.set(key, [...(groups.get(key) ?? []), { slot, definition }]);
  }
  const visibleGroups = GROUP_ORDER.map((key) => ({
    key,
    label: GROUP_LABEL[key],
    entries: groups.get(key) ?? [],
  })).filter((group) => group.entries.length > 0);
  const tokenCount = Object.keys(tokens).length;

  return (
    <div
      className="component-token-facts"
      aria-label="Component-level token slots"
    >
      <div className="component-token-facts__grid">
        {visibleGroups.map((group) => (
          <section className="token-facts-label" key={group.key}>
            <header className="token-facts-label__header">
              <h4>{group.label} token slots</h4>
              <span>
                {group.entries.length} slot
                {group.entries.length === 1 ? "" : "s"}
              </span>
            </header>
            <div className="token-facts-label__bar" aria-hidden />
            <dl className="token-facts-label__rows">
              {group.entries.map(({ slot, definition }) => (
                <div className="token-facts-label__row" key={slot}>
                  <dt>
                    <code>{slot}</code>
                    <span>{cssVarForSlot(slot)}</span>
                  </dt>
                  <dd>
                    <span className="token-facts-label__value">
                      {isColorish(definition.fallback) && (
                        <span
                          className="token-swatch"
                          style={{ background: definition.fallback }}
                          aria-hidden
                        />
                      )}
                      {definition.fallback ?? "none"}
                    </span>
                    <span>{definition.layer ?? "unlayered"}</span>
                  </dd>
                  <dd className="token-facts-label__resolve">
                    {definition.resolvesTo ?? "No resolving token"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
