import { useEffect, useState, useSyncExternalStore } from "react";
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
  Popover,
  Progress,
  Stat,
  TextField,
  Toast,
  type ToastVariant,
} from "@full-stack-ds/react";
import type { SiteEventKind, SiteState, SiteStore } from "../site-store";
import { DeviceKeyboard } from "./DeviceKeyboard";
import { TREATS } from "./treats";

const WORD_GOAL = 50;

export type Page = "draft" | "stats" | "treats";
const PAGES: { page: Page; label: string }[] = [
  { page: "draft", label: "Draft" },
  { page: "stats", label: "Stats" },
  { page: "treats", label: "Treats" },
];

// Each device is its own browser, so each frame routes on its own hash
// (`#/stats`). The `#/` prefix keeps the browser from jumping to an element id.
function pageFromHash(): Page {
  const page = location.hash.replace(/^#\/?/, "");
  return PAGES.some((p) => p.page === page) ? (page as Page) : "draft";
}
function usePage(): Page {
  const [page, setPage] = useState(pageFromHash);
  useEffect(() => {
    const onHash = () => {
      setPage(pageFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return page;
}

function plural(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

const TOAST_VARIANT: Record<SiteEventKind, ToastVariant> = {
  sent: "success",
  ordered: "success",
  deleted: "warning",
  signout: "info",
};

export function Site({ store, onScreenKeyboard = false }: { store: SiteStore; onScreenKeyboard?: boolean }) {
  const state = useSyncExternalStore(store.subscribe, store.get);
  const page = usePage();

  return (
    <div className="site" data-page={page}>
      <header className="site__nav">
        <span className="site__brand">🐾 Cat Productivity Suite</span>
        <nav className="site__links" aria-label="Sections">
          {PAGES.map((p) => (
            <a key={p.page} href={`#/${p.page}`} aria-current={page === p.page ? "page" : undefined}>
              {p.label}
            </a>
          ))}
        </nav>
        <span className="site__user">
          <Badge intent={state.napping ? "info" : "warning"}>{state.napping ? "Napping" : "Very busy"}</Badge>
          <AccountMenu store={store} state={state} />
        </span>
      </header>

      <main className="site__main">
        {page === "draft" && <DraftPage store={store} state={state} />}
        {page === "stats" && <StatsPage state={state} />}
        {page === "treats" && <TreatsPage store={store} state={state} />}
      </main>

      <EventToast state={state} />
      {onScreenKeyboard && <DeviceKeyboard />}
    </div>
  );
}

function AccountMenu({ store, state }: { store: SiteStore; state: SiteState }) {
  const [open, setOpen] = useState(false);
  const go = (page: Page) => {
    location.hash = `#/${page}`;
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen} placement="bottom">
      <Popover.Trigger className="site__avatar-button" aria-label="Account menu">
        <Avatar name="Mr. Whiskers" initials="MW" size="small" />
      </Popover.Trigger>
      <Popover.Content className="site__menu" data-account-menu="">
        <div className="site__menu-who">
          <strong>Mr. Whiskers</strong>
          <small>Chief Keyboard Officer</small>
        </div>
        <Button variant="ghost" onClick={() => go("stats")}>Your stats</Button>
        <Button variant="ghost" onClick={() => go("treats")}>Treat shop</Button>
        <Button variant="ghost" onClick={() => store.set({ napping: !state.napping })}>
          {state.napping ? "Wake up" : "Start a nap"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setOpen(false);
            store.emit("signout", "Nice try", "Cats don't sign out. The keyboard is still warm.");
          }}
        >
          Sign out
        </Button>
      </Popover.Content>
    </Popover>
  );
}

// Every device shows the latest event. Keyed by id, so a repeat of the same
// action is a fresh toast rather than a no-op.
function EventToast({ state }: { state: SiteState }) {
  const event = state.event;
  const [openId, setOpenId] = useState<number | null>(null);
  useEffect(() => {
    if (event) setOpenId(event.id);
  }, [event]);
  if (!event) return null;
  return (
    <Toast
      key={event.id}
      data-site-toast={event.kind}
      open={openId === event.id}
      onOpenChange={(open) => setOpenId(open ? event.id : null)}
      variant={TOAST_VARIANT[event.kind]}
      title={event.title}
    >
      {event.message}
    </Toast>
  );
}

function DraftPage({ store, state }: { store: SiteStore; state: SiteState }) {
  const words = wordCount(state.draft);
  const longestRun = Math.max(0, ...(state.draft.match(/(.)\1*/g) ?? []).map((run) => run.length));
  return (
    <div className="site__columns">
      <section className="site__draft">
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
              <Button
                onClick={() =>
                  store.emit(
                    "sent",
                    "Sent to editor",
                    `${plural(words, "word")} on their way. The editor has been notified ${plural(state.sentToEditor + 1, "time")}.`,
                    { sentToEditor: state.sentToEditor + 1 },
                  )
                }
              >
                Send to editor
              </Button>
              <Button variant="secondary" onClick={() => (location.hash = "#/treats")}>
                Order treats
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  store.emit("deleted", "Draft deleted", `${plural(words, "word")} gone. Again.`, {
                    draft: "",
                    deleted: state.deleted + 1,
                  })
                }
              >
                Delete everything
              </Button>
            </div>
          </CardContent>
        </Card>
        {state.draft && (
          <Alert intent="warning" level="inline">
            <AlertTitle>Unsaved genius</AlertTitle>
            <AlertBody>
              {plural(words, "word")} and counting. The editor has been notified {plural(state.sentToEditor, "time")}.
            </AlertBody>
          </Alert>
        )}
      </section>

      <aside className="site__stats">
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
              <div id="treats-ordered">
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
    </div>
  );
}

function StatsPage({ state }: { state: SiteState }) {
  const words = wordCount(state.draft);
  const counts = new Map<string, number>();
  for (const ch of state.draft.replace(/\s/g, "")) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  const [favourite] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const stats: { label: string; value: string | number; up?: boolean }[] = [
    { label: "Words", value: words, up: words > 0 },
    { label: "Characters", value: state.draft.length, up: state.draft.length > 0 },
    { label: "Favourite key", value: favourite ? `“${favourite[0]}” ×${favourite[1]}` : "—" },
    { label: "Sent to editor", value: state.sentToEditor, up: state.sentToEditor > 0 },
    { label: "Drafts deleted", value: state.deleted },
    { label: "Treats ordered", value: state.treatsOrdered, up: state.treatsOrdered > 0 },
  ];
  return (
    <div className="site__page">
      <h1 className="site__title">Stats</h1>
      <div className="site__stat-grid">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent>
              <small>{s.label}</small>
              <Stat trend={s.up ? "up" : "neutral"}>{s.value}</Stat>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>Daily word goal</CardHeader>
        <CardContent>
          <Progress
            label={`${words} of ${WORD_GOAL} words`}
            value={Math.min(100, Math.round((words / WORD_GOAL) * 100))}
            showValue
            intent={words >= WORD_GOAL ? "success" : "info"}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>Recent activity</CardHeader>
        <CardContent>
          {state.activity.length ? (
            <ol className="site__activity" data-activity="">
              {state.activity.map((e) => (
                <li key={e.id}>
                  <strong>{e.title}</strong> — {e.message}
                </li>
              ))}
            </ol>
          ) : (
            <p className="site__muted">Nothing yet. Go mash some keys.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TreatsPage({ store, state }: { store: SiteStore; state: SiteState }) {
  return (
    <div className="site__page">
      <h1 className="site__title">Treat shop</h1>
      <p className="site__muted">Priced in purrs. Delivered to the bowl by the kitchen.</p>
      <div className="site__product-grid">
        {TREATS.map((t) => {
          const inBowl = state.treatOrders[t.id] ?? 0;
          return (
            <Card key={t.id} data-product={t.id}>
              <CardContent>
                <div className="site__product-art" aria-hidden="true">{t.emoji}</div>
                <div className="site__product-head">
                  <strong>{t.name}</strong>
                  <Badge intent="info">{t.price} purrs</Badge>
                </div>
                <p className="site__muted">{t.blurb}</p>
                <div className="site__product-foot">
                  <small>{inBowl ? `In the bowl: ${inBowl}` : "Not in the bowl yet"}</small>
                  <Button
                    size="small"
                    aria-label={`Order ${t.name}`}
                    onClick={() =>
                      store.emit("ordered", "Treat ordered", `${t.name} is on its way (${state.treatsOrdered + 1} ordered today).`, {
                        treatsOrdered: state.treatsOrdered + 1,
                        treatOrders: { ...state.treatOrders, [t.id]: inBowl + 1 },
                      })
                    }
                  >
                    Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
