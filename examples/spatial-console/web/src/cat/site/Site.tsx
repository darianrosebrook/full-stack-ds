import { useSyncExternalStore } from "react";
import {
  Alert,
  AlertBody,
  AlertTitle,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Progress,
  Stat,
  TextField,
} from "@full-stack-ds/react";
import type { SiteStore } from "../site-store";
import { DeviceKeyboard } from "./DeviceKeyboard";

const WORD_GOAL = 50;

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function Site({ store, onScreenKeyboard = false }: { store: SiteStore; onScreenKeyboard?: boolean }) {
  const state = useSyncExternalStore(store.subscribe, store.get);
  const words = wordCount(state.draft);
  const longestRun = Math.max(0, ...(state.draft.match(/(.)\1*/g) ?? []).map((run) => run.length));

  return (
    <div className="site">
      <header className="site__nav">
        <span className="site__brand">🐾 Cat Productivity Suite</span>
        <nav className="site__links" aria-label="Sections">
          <a href="#draft">Draft</a>
          <a href="#stats">Stats</a>
          <a href="#treats">Treats</a>
        </nav>
        <span className="site__user">
          <Badge intent="warning">Very busy</Badge>
          <Avatar name="Mr. Whiskers" initials="MW" size="small" />
        </span>
      </header>

      <main className="site__main">
        <section className="site__draft" id="draft">
          <Card>
            <CardHeader>Novel draft — Chapter 1</CardHeader>
            <CardContent>
              <TextField
                name="draft"
                value={state.draft}
                onChange={(draft) => store.set({ draft })}
                slots={{
                  label: "What happens next?",
                  description: "Autosaves to the laptop, the tablet and the phone.",
                }}
              />
              <div className="site__actions">
                <Button onClick={() => store.set({ sentToEditor: state.sentToEditor + 1 })}>Send to editor</Button>
                <Button variant="secondary" onClick={() => store.set({ treatsOrdered: state.treatsOrdered + 1 })}>
                  Order treats
                </Button>
                <Button variant="destructive" onClick={() => store.set({ draft: "", deleted: state.deleted + 1 })}>
                  Delete everything
                </Button>
              </div>
            </CardContent>
          </Card>
          {state.draft && (
            <Alert intent="warning" level="inline">
              <AlertTitle>Unsaved genius</AlertTitle>
              <AlertBody>{words} words and counting. The editor has been notified {state.sentToEditor} times.</AlertBody>
            </Alert>
          )}
        </section>

        <aside className="site__stats" id="stats">
          <Card>
            <CardHeader>Today</CardHeader>
            <CardContent>
              <div className="site__stat-row">
                <div>
                  <small>Words</small>
                  <Stat trend={words ? "up" : "neutral"}>{words}</Stat>
                </div>
                <div>
                  <small>Longest key-mash</small>
                  <Stat trend="neutral">{longestRun}</Stat>
                </div>
                <div id="treats">
                  <small>Treats ordered</small>
                  <Stat trend={state.treatsOrdered ? "up" : "neutral"}>{state.treatsOrdered}</Stat>
                </div>
              </div>
              <Progress
                label="Daily word goal"
                value={Math.min(100, Math.round((words / WORD_GOAL) * 100))}
                showValue
                intent={words >= WORD_GOAL ? "success" : "info"}
              />
            </CardContent>
          </Card>
        </aside>
      </main>
      {onScreenKeyboard && <DeviceKeyboard />}
    </div>
  );
}
