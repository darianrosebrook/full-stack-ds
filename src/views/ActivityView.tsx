import { Calendar, Postcard, Stack } from "@full-stack-ds/react";
import type { Bundle } from "../types/data";

/**
 * Repo activity, rendered from build-time data (vite-plugin-fsds-data):
 * recent commits and CAWS spec events as Postcards, with a Calendar strip
 * marking the days that produced them.
 */
export function ActivityView({ bundle }: { bundle: Bundle }) {
  const events = bundle.activity ?? [];
  const dayStamps = Array.from(
    new Set(events.map((e) => e.timestamp.slice(0, 10))),
  )
    .sort()
    .map((day) => new Date(`${day}T12:00:00`));

  return (
    <div className="page">
      <p className="page-eyebrow">Repository</p>
      <h1 className="page-title">Activity</h1>
      <p className="page-lede">
        Censused from the repo at build time — every entry below is a real
        commit or CAWS spec event, newest first.
      </p>

      <section className="section">
        <Stack as="header" variant="horizontal" className="section-header stack-gap-06">
          <h2 className="section-title">Recent days</h2>
          <span className="section-meta">{dayStamps.length} active days</span>
        </Stack>
        <Calendar days={dayStamps} aria-label="Days with recorded activity" />
      </section>

      <section className="section">
        <Stack as="header" variant="horizontal" className="section-header stack-gap-06">
          <h2 className="section-title">Feed</h2>
          <span className="section-meta">{events.length} events</span>
        </Stack>
        <Stack className="stack-gap-05" style={{ maxWidth: 720 }}>
          {events.length === 0 && (
            <p className="muted">No activity recorded at build time.</p>
          )}
          {events.map((e) => (
            <Postcard
              key={e.id}
              postId={e.id}
              author={{ name: e.author, handle: e.author, avatar: "" }}
              timestamp={new Date(e.timestamp).toLocaleString()}
              stats={{ likes: e.stats.commits, replies: e.stats.replies, reposts: e.stats.reposts }}
            >
              <strong>{e.kind === "spec" ? "Spec · " : "Commit · "}</strong>
              {e.title}
            </Postcard>
          ))}
        </Stack>
      </section>
    </div>
  );
}
