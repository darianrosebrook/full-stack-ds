// Public entry point for the social-feed lane-local data layer.
//
// Future framework lanes import the functional API and domain types from here.
// They must NOT import the adapter (`../data`) or the raw fixtures directly —
// this barrel is the boundary.
//
// The API is the canonical mutation result with no commit handles; the future
// UI owns optimistic state and inverse-patch rollback (see social-feed/spec.md).

export {
  FeedApi,
  createFeedApi,
  type FeedApiOptions,
} from "./feed-api.js";

export type {
  AddCommentInput,
  ApiError,
  ApiErrorCode,
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
