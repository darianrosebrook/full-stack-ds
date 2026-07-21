// Lane-local fixture adapter for the social-feed example.
//
// This module is the ONLY layer that touches the raw fixture file shape. It
// reads the static JSON/JSONL fixtures as bundler modules (isomorphic — the
// seam runs unchanged under node via Vitest and in the browser via Vite),
// parses and lightly validates them into the typed domain records declared in
// `../types`, builds the lookup indexes the API needs (authors by id, comments
// grouped by post), and memoizes the parsed snapshot (loaded once into memory).
//
// BOUNDARY: future framework UI code must NOT import this module or the raw
// fixtures directly. UI consumes data only through the functional API in
// `../api`. Fixture-shape knowledge — and the author/comment joins — live here,
// in one typed place. The snapshot is immutable-by-convention; the API holds
// the mutable working copy (so mutations never touch the fixtures).

import authorsRaw from "../../fixtures/authors.json?raw";
import postsRaw from "../../fixtures/posts.jsonl?raw";
import commentsRaw from "../../fixtures/comments.jsonl?raw";
import notificationsRaw from "../../fixtures/notifications.jsonl?raw";

import type {
  Author,
  Comment,
  Notification,
  PostRecord,
} from "../types/index.js";

/** Parse a JSONL string into an array of records, ignoring blank lines. */
function parseJsonl<T>(raw: string, file: string): T[] {
  const out: T[] = [];
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      out.push(JSON.parse(line) as T);
    } catch (cause) {
      // A malformed fixture is a programmer/authoring error, not a domain
      // failure — throw loudly at load time rather than surface it as an
      // ApiError to the UI.
      throw new Error(
        `social-feed adapter: invalid JSONL at ${file}:${i + 1}`,
        { cause },
      );
    }
  }
  return out;
}

/** The fully-parsed, indexed snapshot the API seeds its working copy from. */
export interface FixtureSnapshot {
  /** The viewer whose perspective the feed renders. */
  currentUserId: string;
  /** Authors keyed by id, for joining onto posts/comments. */
  authorById: Map<string, Author>;
  /** Posts in raw record shape, newest first. */
  posts: PostRecord[];
  /** Comments grouped by post id, each list chronological. */
  commentsByPost: Map<string, Comment[]>;
  /** Notifications, newest first. */
  notifications: Notification[];
}

let memoized: FixtureSnapshot | null = null;

/**
 * Parse all fixtures into a typed, indexed snapshot. Memoized: the static
 * fixtures are read and parsed once, then the same snapshot is reused. Pass
 * `force` in tests to re-read after a deliberate fixture edit.
 */
export function loadFixtures(force = false): FixtureSnapshot {
  if (memoized && !force) return memoized;

  const authorsDoc = JSON.parse(authorsRaw) as {
    currentUserId: string;
    authors: Author[];
  };
  const posts = parseJsonl<PostRecord>(postsRaw, "posts.jsonl");
  const comments = parseJsonl<Comment>(commentsRaw, "comments.jsonl");
  const notifications = parseJsonl<Notification>(
    notificationsRaw,
    "notifications.jsonl",
  );

  const authorById = new Map<string, Author>();
  for (const author of authorsDoc.authors) {
    authorById.set(author.id, author);
  }
  if (!authorById.has(authorsDoc.currentUserId)) {
    throw new Error(
      `social-feed adapter: currentUserId ${authorsDoc.currentUserId} is not in authors`,
    );
  }

  // Validate post authors resolve, then sort newest-first.
  for (const post of posts) {
    if (!authorById.has(post.authorId)) {
      throw new Error(
        `social-feed adapter: post ${post.id} references unknown author ${post.authorId}`,
      );
    }
  }
  posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const commentsByPost = new Map<string, Comment[]>();
  for (const comment of comments) {
    const list = commentsByPost.get(comment.postId);
    if (list) list.push(comment);
    else commentsByPost.set(comment.postId, [comment]);
  }
  for (const list of commentsByPost.values()) {
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  notifications.sort((a, b) => b.at.localeCompare(a.at));

  memoized = {
    currentUserId: authorsDoc.currentUserId,
    authorById,
    posts,
    commentsByPost,
    notifications,
  };
  return memoized;
}
