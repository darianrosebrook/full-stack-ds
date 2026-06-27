// Lane-local functional API for the social-feed example.
//
// This is the surface future framework lanes import and call. It is
// promise-returning so the UI's loading / pending / error states are real
// async transitions. Simulated latency and failure live HERE, behind the API —
// never in UI code.
//
// APP-SPECIFIC DECISION (see social-feed/spec.md): the API is the CANONICAL
// async mutation result — "what the server would have committed." It has no
// knowledge of optimistic UI and exposes NO commit handles / transaction
// tokens (no begin/commit/abort, no optimistic-id reconciliation protocol). A
// mutation either resolves { ok: true, value: <committed record> } or
// { ok: false, error }. The future assembly/UI lane owns the optimistic store
// and inverse-patch rollback; on a failed mutation the API leaves its own
// canonical state unchanged, and the UI is responsible for reverting its
// optimistic patch.
//
// BOUNDARY: UI imports from the barrel (`./index.ts`) only — never the adapter
// (`../data`) or the raw fixtures.
//
// Determinism: no wall-clock randomness and no Math.random. Latency is a fixed,
// configurable number of ms (0 in tests). Failure is an explicit flag. New ids
// (posts, comments) derive from monotonic per-instance counters, and new
// timestamps from an injectable clock (default a fixed seed), so the same call
// sequence always yields the same records.

import { loadFixtures, type FixtureSnapshot } from "../data/adapter.js";
import type {
  AddCommentInput,
  ApiError,
  ApiResult,
  Author,
  Comment,
  CommentWithAuthor,
  CreatePostInput,
  FeedQuery,
  Notification,
  Post,
  PostRecord,
  ReactionKind,
  ReactionState,
  ReportPostInput,
} from "../types/index.js";

/** Construction-time options. All optional with deterministic defaults. */
export interface FeedApiOptions {
  /** Simulated latency applied to every call, in ms. Default 0. */
  latencyMs?: number;
  /**
   * When true, read calls (`listFeed`) resolve `{ ok: false, LOAD_FAILED }` to
   * exercise the error + retry path. Toggle via `simulateLoadFailure`.
   */
  failLoads?: boolean;
  /**
   * When true, mutation calls resolve `{ ok: false, MUTATION_FAILED }` to
   * exercise the failed-mutation path (the UI rolls back its optimistic patch).
   * Toggle via `simulateMutationFailure`.
   */
  failMutations?: boolean;
  /**
   * Fixed ISO-8601 base timestamp for generated records. Default a fixed seed
   * so created posts/comments are deterministic (no wall-clock).
   */
  clockSeed?: string;
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ok<T>(value: T): ApiResult<T> {
  return { ok: true, value };
}

function err<T>(error: ApiError): ApiResult<T> {
  return { ok: false, error };
}

function cloneRecord(p: PostRecord): PostRecord {
  return { ...p, reactions: { ...p.reactions } };
}

/** The social-feed functional API. Construct via `createFeedApi()`. */
export class FeedApi {
  private readonly authorById: Map<string, Author>;
  private readonly currentUserId: string;
  /** Mutable working copies (API-owned, seeded from the immutable snapshot). */
  private posts: PostRecord[];
  private commentsByPost: Map<string, Comment[]>;
  private readonly notifications: Notification[];

  private latencyMs: number;
  private failLoads: boolean;
  private failMutations: boolean;
  private readonly clockBase: number;

  // Monotonic counters for deterministic generated ids/timestamps.
  private postSeq = 0;
  private commentSeq = 0;
  private tick = 0;

  constructor(snapshot: FixtureSnapshot, options: FeedApiOptions = {}) {
    this.authorById = snapshot.authorById;
    this.currentUserId = snapshot.currentUserId;
    this.posts = snapshot.posts.map(cloneRecord);
    this.commentsByPost = new Map(
      [...snapshot.commentsByPost.entries()].map(([k, v]) => [
        k,
        v.map((c) => ({ ...c })),
      ]),
    );
    this.notifications = snapshot.notifications.map((n) => ({ ...n }));
    this.latencyMs = options.latencyMs ?? 0;
    this.failLoads = options.failLoads ?? false;
    this.failMutations = options.failMutations ?? false;
    this.clockBase = Date.parse(options.clockSeed ?? "2026-06-26T12:00:00.000Z");
  }

  simulateLoadFailure(enabled: boolean): void {
    this.failLoads = enabled;
  }

  simulateMutationFailure(enabled: boolean): void {
    this.failMutations = enabled;
  }

  /** Deterministic, monotonically increasing ISO timestamp for new records. */
  private nextTimestamp(): string {
    this.tick += 1;
    return new Date(this.clockBase + this.tick * 1000).toISOString();
  }

  private author(id: string): Author {
    const a = this.authorById.get(id);
    if (a) return a;
    // Unknown author is a programmer error (fixture/mutation bug), not a domain
    // failure — fall back to a synthetic identity rather than crash a read.
    return { id, name: id, handle: id, avatar: "" };
  }

  /** Join a raw post record into the API's returned `Post` shape. */
  private join(post: PostRecord): Post {
    const comments: CommentWithAuthor[] = (
      this.commentsByPost.get(post.id) ?? []
    ).map((c) => ({ ...c, author: this.author(c.authorId) }));
    return {
      ...cloneRecord(post),
      author: this.author(post.authorId),
      comments,
      commentCount: comments.length,
    };
  }

  /** List the feed (newest first). Excludes hidden posts unless asked. */
  async listFeed(query: FeedQuery = {}): Promise<ApiResult<Post[]>> {
    await delay(this.latencyMs);
    if (this.failLoads) {
      return err({
        code: "LOAD_FAILED",
        message: "Simulated load failure while listing the feed.",
      });
    }
    const visible = this.posts.filter(
      (p) => query.includeHidden || !p.hidden,
    );
    return ok(visible.map((p) => this.join(p)));
  }

  /** Create a post authored by the current user. Resolves the committed post. */
  async createPost(input: CreatePostInput): Promise<ApiResult<Post>> {
    await delay(this.latencyMs);
    if (input.body.trim() === "") {
      return err({ code: "EMPTY_BODY", message: "Post body cannot be empty." });
    }
    if (this.failMutations) {
      return err({
        code: "MUTATION_FAILED",
        message: "Simulated failure creating the post.",
      });
    }
    this.postSeq += 1;
    const record: PostRecord = {
      id: `p-new-${this.postSeq.toString().padStart(4, "0")}`,
      authorId: this.currentUserId,
      body: input.body,
      media: input.media ?? null,
      createdAt: this.nextTimestamp(),
      reactions: { like: 0, celebrate: 0, insightful: 0 },
      viewerReaction: null,
      hidden: false,
      reported: false,
    };
    this.posts.unshift(record);
    return ok(this.join(record));
  }

  /** Add a comment to a post. Resolves the committed comment (with author). */
  async addComment(
    input: AddCommentInput,
  ): Promise<ApiResult<CommentWithAuthor>> {
    await delay(this.latencyMs);
    if (input.body.trim() === "") {
      return err({
        code: "EMPTY_BODY",
        message: "Comment body cannot be empty.",
      });
    }
    const post = this.posts.find((p) => p.id === input.postId);
    if (!post) {
      return err({
        code: "NOT_FOUND",
        message: `Post ${input.postId} not found.`,
      });
    }
    if (this.failMutations) {
      return err({
        code: "MUTATION_FAILED",
        message: "Simulated failure adding the comment.",
      });
    }
    this.commentSeq += 1;
    const comment: Comment = {
      id: `c-new-${this.commentSeq.toString().padStart(4, "0")}`,
      postId: input.postId,
      authorId: this.currentUserId,
      body: input.body,
      createdAt: this.nextTimestamp(),
    };
    const list = this.commentsByPost.get(input.postId);
    if (list) list.push(comment);
    else this.commentsByPost.set(input.postId, [comment]);
    return ok({ ...comment, author: this.author(this.currentUserId) });
  }

  /**
   * Toggle the viewer's reaction of `kind` on a post. Resolves the canonical
   * post reaction state after the toggle. Toggling the active reaction clears
   * it; switching kinds moves the count.
   */
  async toggleReaction(
    postId: string,
    kind: ReactionKind,
  ): Promise<ApiResult<ReactionState>> {
    await delay(this.latencyMs);
    const post = this.posts.find((p) => p.id === postId);
    if (!post) {
      return err({ code: "NOT_FOUND", message: `Post ${postId} not found.` });
    }
    if (this.failMutations) {
      return err({
        code: "MUTATION_FAILED",
        message: "Simulated failure toggling the reaction.",
      });
    }
    const prev = post.viewerReaction;
    if (prev === kind) {
      // Clear the active reaction.
      post.reactions[kind] = Math.max(0, post.reactions[kind] - 1);
      post.viewerReaction = null;
    } else {
      if (prev) post.reactions[prev] = Math.max(0, post.reactions[prev] - 1);
      post.reactions[kind] += 1;
      post.viewerReaction = kind;
    }
    return ok({
      postId,
      viewerReaction: post.viewerReaction,
      reactions: { ...post.reactions },
    });
  }

  /** Hide a post from the viewer's feed. Resolves the committed post. */
  async hidePost(postId: string): Promise<ApiResult<Post>> {
    await delay(this.latencyMs);
    const post = this.posts.find((p) => p.id === postId);
    if (!post) {
      return err({ code: "NOT_FOUND", message: `Post ${postId} not found.` });
    }
    if (this.failMutations) {
      return err({
        code: "MUTATION_FAILED",
        message: "Simulated failure hiding the post.",
      });
    }
    post.hidden = true;
    return ok(this.join(post));
  }

  /** Report a post. Resolves the committed post; double-report is typed. */
  async reportPost(input: ReportPostInput): Promise<ApiResult<Post>> {
    await delay(this.latencyMs);
    const post = this.posts.find((p) => p.id === input.postId);
    if (!post) {
      return err({
        code: "NOT_FOUND",
        message: `Post ${input.postId} not found.`,
      });
    }
    if (post.reported) {
      return err({
        code: "ALREADY_REPORTED",
        message: `Post ${input.postId} is already reported.`,
      });
    }
    if (this.failMutations) {
      return err({
        code: "MUTATION_FAILED",
        message: "Simulated failure reporting the post.",
      });
    }
    post.reported = true;
    return ok(this.join(post));
  }

  /** List notifications (newest first). Display-only for the mock. */
  async listNotifications(): Promise<ApiResult<Notification[]>> {
    await delay(this.latencyMs);
    if (this.failLoads) {
      return err({
        code: "LOAD_FAILED",
        message: "Simulated load failure while listing notifications.",
      });
    }
    return ok(this.notifications.map((n) => ({ ...n })));
  }
}

/**
 * Factory: load the fixture snapshot via the adapter and construct an API.
 * Future framework lanes call this once and hold the returned instance.
 */
export function createFeedApi(options: FeedApiOptions = {}): FeedApi {
  return new FeedApi(loadFixtures(), options);
}
