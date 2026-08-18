import { useState } from "react";
import {
  Avatar,
  Stack,
  CodeBlock,
  Dialog,
  Image,
  Markdown,
  ProfileFlag,
} from "@full-stack-ds/react";

const ABOUT_MD = `## One contract, five frameworks

This showcase is the existence proof for an architectural claim: a single JSON
contract per component, one polymorphic **Stack** primitive, and framework
emitters that produce idiomatic source for React, Vue, Svelte, Angular, and
Lit — plus React Native, SwiftUI, Jetpack Compose, and a Figma descriptor
target.

The rail binds every generated artifact back to the contract that produced it:

\`\`\`bash
pnpm run governed:rail        # regenerate-all + verify (required mode)
pnpm run generate:check      # schema + cross-graph semantic gate
pnpm test                    # root suite incl. consumption guards
\`\`\`

Nothing here is hand-drawn: the numbers on the landing page are censused from
the \`packages/\` tree at build time, and the consumption guards keep the
showcase honest about eating its own dogfood.`;

/** Inline SVG figure for the About dialog (the repo ships no raster logo). */
const FIGURE_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="120" viewBox="0 0 480 120"><rect width="480" height="120" rx="12" fill="#f4f1ea"/><g fill="none" stroke="#333" stroke-width="2"><rect x="24" y="36" width="72" height="48" rx="8"/><rect x="204" y="36" width="72" height="48" rx="8"/><rect x="384" y="36" width="72" height="48" rx="8"/></g><path d="M96 60h108M276 60h108" stroke="#333" stroke-width="2"/><text x="36" y="26" font-family="monospace" font-size="13" fill="#333">contract</text><text x="216" y="26" font-family="monospace" font-size="13" fill="#333">IR</text><text x="396" y="26" font-family="monospace" font-size="13" fill="#333">5 targets</text></svg>`,
  );

/** "About this project" dialog from the Header — real markdown + figure. */
export function AboutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [tab, setTab] = useState<"about" | "commands">("about");
  if (!open) return null;
  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
      size="md"
      slots={{ title: "About Full-Stack DS" }}
      aria-label="About Full-Stack DS"
    >
      {tab === "about" ? (
        <>
          <ProfileFlag>
            <Avatar src={FIGURE_URI} name="Full-Stack DS" size="32" />
            <span>
              <strong>Full-Stack DS</strong> — contract-governed design system
            </span>
          </ProfileFlag>
          <Image
            src={FIGURE_URI}
            alt="Diagram: one contract flowing through an IR into five framework targets"
            aspectRatio="wide"
            radius="md"
          />
          <Markdown content={ABOUT_MD} />
        </>
      ) : (
        <CodeBlock
          language="bash"
          code={`pnpm run dev                      # showcase at :5173\npnpm run generate -- --target=all   # regenerate every target\npnpm run governed:rail             # admission rail (required mode)\npnpm run docs:check-claims         # governed doc numbers`}
        />
      )}
      <Stack variant="horizontal" className="stack-gap-04" style={{ marginTop: "var(--fsds-core-spacing-size-05)" }}>
        <button type="button" className={`view-tab${tab === "about" ? " view-tab--active" : ""}`} onClick={() => setTab("about")}>
          About
        </button>
        <button type="button" className={`view-tab${tab === "commands" ? " view-tab--active" : ""}`} onClick={() => setTab("commands")}>
          Commands
        </button>
      </Stack>
    </Dialog>
  );
}
