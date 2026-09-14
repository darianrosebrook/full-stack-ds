import type { GraphCategory } from "./docsGraphAdapter";
import { categoryColor } from "./docsGraphAdapter";

/**
 * Authority-category legend for the docs graph. Colors come from the same
 * resolved palette the canvas paints with, so the legend cannot drift from
 * the nodes it describes.
 */

export interface GraphLegendProps {
  categories: GraphCategory[];
  palette: string[];
}

export function GraphLegend({ categories, palette }: GraphLegendProps) {
  return (
    <ul className="docs-graph-legend" aria-label="Graph categories by frontmatter authority">
      {categories.map((category) => (
        <li key={category.key} className="docs-graph-legend__item">
          <span
            className="docs-graph-legend__chip"
            style={{ background: categoryColor(category, palette) }}
            aria-hidden="true"
          />
          <span className="docs-graph-legend__label">{category.key}</span>
          <span className="docs-graph-legend__count">{category.count}</span>
        </li>
      ))}
    </ul>
  );
}
