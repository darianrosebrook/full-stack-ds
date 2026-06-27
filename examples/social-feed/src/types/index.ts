// Lane-local app-layer domain + API types for the social-feed example.
//
// These are NOT package exports. They describe the shapes the lane-local
// adapter (`../data`) parses out of the static fixtures and the shapes the
// lane-local functional API (`../api`) returns to future framework lanes.
// Framework UI code consumes these types via the API surface only.
//
// Design note (see social-feed/spec.md): the API is the CANONICAL async
// mutation result — "what the server would have committed." It has no
// knowledge of optimistic UI and exposes no commit handles. The future UI
// owns the optimistic store and inverse-patch rollback.

/** A feed author / user identity. */
export interface Author {
  /** Stable author id, e.g. "u-ada". */
  id: string;
  /** Display name. */
  name: string;
  /** @handle without the leading "@". */
  handle: string;
  /** Avatar reference (mock; not fetched). */
  avatar: string;
}

/** The set of reaction kinds a post supports. */
export type ReactionKind = "like" | "celebrate" | "insightful";

/** A comment on a post. */
export interface Comment {
  /** Stable comment id, e.g. "c-1001". */
  id: string;
  /** Owning post id. */
  postId: string;
  /** Comment author id (joins to `Author.id`). */
  authorId: string;
  /** Comment body text. */
  body: string;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}

/** A feed post in its raw fixture shape (counts + flags, not joined). */
export interface PostRecord {
  /** Stable post id, e.g. "p-2001". */
  id: string;
  /** Author id (joins to `Author.id`). */
  authorId: string;
  /** Post body text. */
  body: string;
  /** Optional media reference (mock); null when text-only. */
  media: string | null;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** Reaction counts keyed by kind. */
  reactions: Record<ReactionKind, number>;
  /** The current user's active reaction on this post, or null. */
  viewerReaction: ReactionKind | null;
  /** Whether the current user has hidden this post. */
  hidden: boolean;
  /** Whether the current user has reported this post. */
  reported: boolean;
}

/** A feed post joined with its author and comments, as the API returns it. */
export interface Post extends PostRecord {
  /** Resolved author identity. */
  author: Author;
  /** Chronologically ordered comments (each with a resolved author). */
  comments: CommentWithAuthor[];
  /** Convenience count (comments.length) for the UI. */
  commentCount: number;
}

/** A comment joined with its resolved author. */
export interface CommentWithAuthor extends Comment {
  author: Author;
}

/** A notification / moderation entry for the secondary surface. */
export interface Notification {
  /** Stable notification id. */
  id: string;
  /** Kind, e.g. "reply" | "reaction" | "moderation". */
  kind: string;
  /** Display text. */
  message: string;
  /** Whether the viewer has read it. */
  read: boolean;
  /** ISO-8601 timestamp. */
  at: string;
}

/** The canonical reaction state of a post after a toggle. */
export interface ReactionState {
  postId: string;
  /** The viewer's active reaction after the toggle, or null if cleared. */
  viewerReaction: ReactionKind | null;
  /** Updated reaction counts. */
  reactions: Record<ReactionKind, number>;
}

/** Inputs to `listFeed` (filtering is minimal for the mock). */
export interface FeedQuery {
  /** When true, include posts the viewer has hidden; default false. */
  includeHidden?: boolean;
}

/** Typed error codes the API surfaces instead of throwing untyped errors. */
export type ApiErrorCode =
  | "LOAD_FAILED"
  | "NOT_FOUND"
  | "EMPTY_BODY"
  | "ALREADY_REPORTED"
  | "MUTATION_FAILED";

/** A typed API error. Callers narrow on `code` to drive UI error states. */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
}

/**
 * Discriminated result the API methods resolve to. Methods never reject for
 * domain failures; they resolve `{ ok: false, error }` so future UI lanes can
 * model error states — and own optimistic rollback — without try/catch around
 * every call. (Programmer errors — e.g. a malformed fixture at construction
 * time — may still throw.)
 */
export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ApiError };

/** Inputs to `createPost`. */
export interface CreatePostInput {
  body: string;
  media?: string | null;
}

/** Inputs to `addComment`. */
export interface AddCommentInput {
  postId: string;
  body: string;
}

/** Inputs to `reportPost`. */
export interface ReportPostInput {
  postId: string;
  reason: string;
}
