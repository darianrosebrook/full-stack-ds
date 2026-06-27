import { describe, expect, it } from "vitest";

import { loadFixtures } from "../data/adapter.js";
import { FeedApi, createFeedApi } from "./feed-api.js";
import type { ApiResult } from "../types/index.js";

/** Unwrap a successful result or fail the test with the typed error. */
function expectOk<T>(result: ApiResult<T>): T {
  if (!result.ok) {
    throw new Error(
      `expected ok result, got error ${result.error.code}: ${result.error.message}`,
    );
  }
  return result.value;
}

/** Fresh API per test (latencyMs 0 — deterministic, no wall-clock waits). */
function freshApi(): FeedApi {
  return new FeedApi(loadFixtures(), {});
}

describe("social-feed fixture adapter", () => {
  it("parses posts/comments/authors, joins, and orders newest-first", () => {
    const snapshot = loadFixtures(true);

    // Six posts in the fixture; sorted newest-first by createdAt.
    expect(snapshot.posts).toHaveLength(6);
    expect(snapshot.posts[0].id).toBe("p-2001"); // 09:00 is newest

    // Current user resolves and is a known author.
    expect(snapshot.currentUserId).toBe("u-ada");
    expect(snapshot.authorById.get("u-ada")?.handle).toBe("ada");

    // Comments grouped by post, chronological within a post.
    const onP2001 = snapshot.commentsByPost.get("p-2001");
    expect(onP2001?.map((c) => c.id)).toEqual(["c-1001", "c-1002"]);
  });
});

describe("listFeed read", () => {
  it("returns visible posts newest-first with joined author + comments", async () => {
    const feed = expectOk(await freshApi().listFeed());
    // Hidden post p-2006 is excluded by default → 5 visible.
    expect(feed).toHaveLength(5);
    expect(feed.map((p) => p.id)).not.toContain("p-2006");

    const top = feed[0];
    expect(top.id).toBe("p-2001");
    expect(top.author.name).toBe("Grace Hopper");
    expect(top.commentCount).toBe(2);
    expect(top.comments[0].author.handle).toBe("ada");
  });

  it("includes hidden posts when asked", async () => {
    const feed = expectOk(await freshApi().listFeed({ includeHidden: true }));
    expect(feed.map((p) => p.id)).toContain("p-2006");
  });
});

describe("createPost / addComment mutation", () => {
  it("creates a post with a deterministic id and prepends it to the feed", async () => {
    const api = freshApi();
    const post = expectOk(await api.createPost({ body: "Hello, world." }));
    expect(post.id).toBe("p-new-0001");
    expect(post.author.id).toBe("u-ada");
    expect(post.commentCount).toBe(0);

    const feed = expectOk(await api.listFeed());
    expect(feed[0].id).toBe("p-new-0001"); // prepended

    // Deterministic, monotonic ids.
    const post2 = expectOk(await api.createPost({ body: "Second." }));
    expect(post2.id).toBe("p-new-0002");
  });

  it("rejects an empty post body with a typed EMPTY_BODY error", async () => {
    const result = await freshApi().createPost({ body: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("EMPTY_BODY");
  });

  it("adds a comment and the post's comment count grows on reload", async () => {
    const api = freshApi();
    const comment = expectOk(
      await api.addComment({ postId: "p-2003", body: "Great work." }),
    );
    expect(comment.id).toBe("c-new-0001");
    expect(comment.author.id).toBe("u-ada");

    const feed = expectOk(await api.listFeed());
    const p2003 = feed.find((p) => p.id === "p-2003");
    expect(p2003?.commentCount).toBe(2); // had 1 (c-1004) + new
  });

  it("rejects a comment on an unknown post with NOT_FOUND", async () => {
    const result = await freshApi().addComment({
      postId: "p-9999",
      body: "hi",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
  });
});

describe("toggleReaction mutation", () => {
  it("adds, then clears, the viewer reaction and adjusts counts", async () => {
    const api = freshApi();
    // p-2001 starts: like 12, viewerReaction null.
    const added = expectOk(await api.toggleReaction("p-2001", "like"));
    expect(added.viewerReaction).toBe("like");
    expect(added.reactions.like).toBe(13);

    const cleared = expectOk(await api.toggleReaction("p-2001", "like"));
    expect(cleared.viewerReaction).toBeNull();
    expect(cleared.reactions.like).toBe(12);
  });

  it("switches reaction kind, moving the count between buckets", async () => {
    // p-2002 starts: insightful 18, viewerReaction "insightful".
    const switched = expectOk(
      await freshApi().toggleReaction("p-2002", "like"),
    );
    expect(switched.viewerReaction).toBe("like");
    expect(switched.reactions.insightful).toBe(17);
    expect(switched.reactions.like).toBe(31);
  });
});

describe("hidePost / reportPost mutation", () => {
  it("hides a post so it leaves the default feed", async () => {
    const api = freshApi();
    expectOk(await api.hidePost("p-2003"));
    const feed = expectOk(await api.listFeed());
    expect(feed.map((p) => p.id)).not.toContain("p-2003");
  });

  it("reports a post and rejects a double report with ALREADY_REPORTED", async () => {
    const api = freshApi();
    const reported = expectOk(
      await api.reportPost({ postId: "p-2005", reason: "spam" }),
    );
    expect(reported.reported).toBe(true);

    const again = await api.reportPost({ postId: "p-2005", reason: "spam" });
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error.code).toBe("ALREADY_REPORTED");
  });

  it("does not bleed mutations across separate API instances", async () => {
    const a = freshApi();
    await a.reportPost({ postId: "p-2005", reason: "spam" });

    const b = freshApi();
    const onB = expectOk(await b.listFeed());
    expect(onB.find((p) => p.id === "p-2005")?.reported).toBe(false);
  });
});

describe("simulated failure produces typed errors", () => {
  it("fails listFeed with LOAD_FAILED while the flag is on, then recovers", async () => {
    const api = freshApi();
    api.simulateLoadFailure(true);
    const failed = await api.listFeed();
    expect(failed.ok).toBe(false);
    if (!failed.ok) expect(failed.error.code).toBe("LOAD_FAILED");

    api.simulateLoadFailure(false);
    const recovered = expectOk(await api.listFeed());
    expect(recovered).toHaveLength(5);
  });

  it("fails mutations with MUTATION_FAILED under the failure flag", async () => {
    const api = createFeedApi({ failMutations: true });
    const result = await api.createPost({ body: "should fail" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("MUTATION_FAILED");
  });
});

describe("API does not own optimistic rollback (canonical state unchanged on failure)", () => {
  it("a failed toggleReaction leaves the canonical reaction state unchanged", async () => {
    const api = freshApi();

    // Capture canonical state before.
    const before = expectOk(await api.listFeed());
    const p2001Before = before.find((p) => p.id === "p-2001")!;
    expect(p2001Before.reactions.like).toBe(12);
    expect(p2001Before.viewerReaction).toBeNull();

    // Turn on mutation failure and attempt to react.
    api.simulateMutationFailure(true);
    const failed = await api.toggleReaction("p-2001", "like");
    expect(failed.ok).toBe(false);
    if (!failed.ok) expect(failed.error.code).toBe("MUTATION_FAILED");

    // The API's canonical state is UNCHANGED — it did not apply, then revert;
    // it simply never mutated. Rolling back any optimistic UI patch is the
    // future UI lane's job, not the API's. No commit handle is involved.
    api.simulateMutationFailure(false);
    const after = expectOk(await api.listFeed());
    const p2001After = after.find((p) => p.id === "p-2001")!;
    expect(p2001After.reactions.like).toBe(12);
    expect(p2001After.viewerReaction).toBeNull();
  });

  it("a failed createPost does not add a post to the canonical feed", async () => {
    const api = createFeedApi({ failMutations: true });
    const lenBefore = expectOk(await api.listFeed()).length;

    const failed = await api.createPost({ body: "optimistic-only" });
    expect(failed.ok).toBe(false);

    api.simulateMutationFailure(false);
    const after = expectOk(await api.listFeed());
    expect(after).toHaveLength(lenBefore);
    expect(after.some((p) => p.body === "optimistic-only")).toBe(false);
  });
});
