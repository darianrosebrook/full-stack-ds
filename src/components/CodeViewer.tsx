import { useMemo, useRef, useEffect, useState } from "react";
import { Card, Button, CodeBlock, Stack, Toast, Tooltip  } from "@full-stack-ds/react";
import type { TraceHit } from "../trace/types";

interface CodeViewerProps {
  code: string;
  filename?: string;
  hits?: TraceHit[];
  onHitClick?: (hit: TraceHit) => void;
  selectedHitIndex?: number | null;
}

interface Segment {
  text: string;
  hit?: TraceHit;
  hitIndex?: number;
}

function segmentLine(line: string, lineHits: { hit: TraceHit; index: number; col: number; len: number }[]): Segment[] {
  if (lineHits.length === 0) return [{ text: line }];
  const sorted = [...lineHits].sort((a, b) => a.col - b.col);
  const segments: Segment[] = [];
  let cursor = 0;
  for (const h of sorted) {
    if (h.col < cursor) continue;
    if (h.col > cursor) segments.push({ text: line.slice(cursor, h.col) });
    const endCol = Math.min(line.length, h.col + h.len);
    segments.push({ text: line.slice(h.col, endCol), hit: h.hit, hitIndex: h.index });
    cursor = endCol;
  }
  if (cursor < line.length) segments.push({ text: line.slice(cursor) });
  return segments;
}

export function CodeViewer({ code, filename, hits = [], onHitClick, selectedHitIndex }: CodeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable (permissions/older embeds) — the toast simply never fires
    }
  };

  const lines = useMemo(() => {
    const raw = code.split("\n");
    const byLine: Record<number, { hit: TraceHit; index: number; col: number; len: number }[]> = {};
    hits.forEach((h, idx) => {
      const line = h.start.line;
      if (!byLine[line]) byLine[line] = [];
      byLine[line].push({ hit: h, index: idx, col: h.start.column, len: h.length });
    });
    return raw.map((text, i) => ({
      lineNumber: i + 1,
      segments: segmentLine(text, byLine[i] ?? []),
    }));
  }, [code, hits]);

  useEffect(() => {
    if (selectedHitIndex == null || !containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>(`[data-hit-index="${selectedHitIndex}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedHitIndex]);

  return (
    <Card className="showcase-card">
      {filename && (
        <Stack variant="horizontal" className="panel-toolbar stack-gap-00">
          <Stack variant="horizontal" className="stack-gap-04" style={{ alignItems: "baseline" }}>
            <span>{filename}</span>
            <span className="subtle">{code.split("\n").length} lines</span>
          </Stack>
          <Button variant="ghost" size="small" ariaLabel="Copy code to clipboard" onClick={copyCode}>
            Copy
          </Button>
        </Stack>
      )}
      <Toast
        open={copied}
        onOpenChange={setCopied}
        title="Copied to clipboard"
        variant="success"
        duration={2500}
      >
        {filename ?? "Source"}
      </Toast>
      <div ref={containerRef}>
        <CodeBlock className="source-viewer__code" code={code} language="plaintext">
          {lines.map(({ lineNumber, segments }) => (
            <Stack as="span" key={lineNumber} variant="horizontal" className="source-viewer__line stack-gap-00">
              <span
                className="subtle"
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 36,
                  flexShrink: 0,
                  textAlign: "right",
                  paddingRight: 12,
                  userSelect: "none",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {lineNumber}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                {segments.map((seg, idx) =>
                  seg.hit ? (
                    <Tooltip key={idx} placement="top" className="source-viewer__trace">
                      <Tooltip.Trigger asChild>
                        <Button
                          variant="ghost"
                          className="source-viewer__annotation"
                          data-hit-index={seg.hitIndex}
                          data-selected={selectedHitIndex === seg.hitIndex}
                          onClick={() => onHitClick?.(seg.hit!)}
                        >
                          {seg.text}
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <strong>{seg.hit.kind}</strong> → {seg.hit.contractPath}
                        {seg.hit.explanation ? ` — ${seg.hit.explanation}` : ""}
                      </Tooltip.Content>
                    </Tooltip>
                  ) : (
                    <span key={idx}>{seg.text || "​"}</span>
                  ),
                )}
              </span>
            </Stack>
          ))}
        </CodeBlock>
      </div>
    </Card>
  );
}
