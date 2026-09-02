import { Card, Badge, Stack } from "@full-stack-ds/react";
import { stateDimensionsOf } from "../../types/data";
import type { ComponentContract, StateDimension } from "../../types/data";

interface StatesGridProps {
  contract: ComponentContract;
}

/** Flag lines derived from authored fields only. Exclusivity mirrors the
 * schema default (mutually exclusive when `exclusive` is omitted). */
function dimensionMeta(dim: StateDimension): string {
  const parts = [dim.exclusive === false ? "values compose freely" : "one value at a time"];
  if (dim.effect) parts.push(`effect: ${dim.effect}`);
  const masks = [...(dim.suppresses?.categories ?? []), ...(dim.suppresses?.names ?? [])];
  if (masks.length > 0) parts.push(`masks ${masks.join(", ")}`);
  return parts.join(" · ");
}

export function StatesGrid({ contract }: StatesGridProps) {
  const dimensions = stateDimensionsOf(contract);
  if (dimensions.length === 0) return null;
  return (
    <Card density="inset">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--fsds-core-spacing-size-06)",
        }}
      >
        {dimensions.map(([axis, dim]) => (
          <Stack key={axis} className="stack-gap-04">
            <Stack variant="horizontal" className="stack-gap-03">
              <Badge
                variant="tag"
                size="sm"
                style={{ fontFamily: "var(--fsds-core-typography-font-family-mono)" }}
              >
                {axis}
              </Badge>
              <span className="muted" style={{ fontSize: "var(--fsds-core-typography-ramp-2)" }}>
                {dim.category}
              </span>
            </Stack>
            <Stack variant="horizontal" className="stack-gap-03" style={{ flexWrap: "wrap" }}>
              {dim.values.map((value) => (
                <Badge key={value} variant="tag" size="sm">
                  {value === dim.initial ? `${value} ·initial` : value}
                </Badge>
              ))}
            </Stack>
            {dim.description ? (
              <span className="muted" style={{ fontSize: "var(--fsds-core-typography-ramp-2)" }}>
                {dim.description}
              </span>
            ) : null}
            <span className="muted" style={{ fontSize: "var(--fsds-core-typography-ramp-2)" }}>
              {dimensionMeta(dim)}
            </span>
          </Stack>
        ))}
      </div>
    </Card>
  );
}
