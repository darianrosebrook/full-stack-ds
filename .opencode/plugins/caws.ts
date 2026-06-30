/*
CAWS-MANAGED-HOOK
# hook_pack: opencode
# hook_pack_version: 5
# caws_min_major: 11
# lineage_refs: 1,4,6,11,12,13,16,17,19,22,23,24,25,26,27,28,29,30,31
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — caws init refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
*/

// CAWS opencode vendor adapter.
//
// opencode's lifecycle interposition is an in-process TypeScript plugin
// surface (https://opencode.ai/docs/plugins). This shim translates opencode's
// plugin callbacks into the SAME shared bash dispatchers every other surface
// uses (.caws/hooks/dispatch/<event>.sh), reusing 100% of the guard/check
// logic.
//
// Blocking: throw on block/ask in tool.execute.before (ask degrades to block
// — opencode has no PreToolUse ask; codex precedent).
//
// Context surfacing: the shared core PRODUCES context — multi-agent peer
// notice, inter-agent message delivery, advisories — as
// hookSpecificOutput.additionalContext on the dispatcher's stdout.
// tool.execute.before stashes it; experimental.chat.system.transform appends
// it to the system prompt on the next model call. (client.session.prompt from
// inside a tool hook silently no-ops; system.transform is the type-confirmed
// injection point.)
//
// updatedInput: the shared quiet-merge.sh rewrites caws worktree merge|destroy
// bash commands; applied by mutating output.args.command before the tool runs.
//
// JSON parsing: the dispatcher's stdout contains one JSON object per handler,
// and jq-emitted objects (additionalContext) are pretty-printed across
// multiple lines. extractJsonObjects() scans for balanced {...} objects so
// both single-line (printf) and pretty-printed (jq) hook output parse.
//
// Fail posture: if .caws/hooks/ is absent, the shim fails OPEN. A plugin-
// internal error in tool.execute.before is caught and fails open (only a CAWS
// block decision throws); a plugin error must never block a tool call.

import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

const SURFACE = 'opencode';
const UNKNOWN_ROOT = '';

let cachedRoot: string | null = null;
let warnedMissing = false;
let currentSessionId: string | null = null;

// Context stashed by tool.execute.before, consumed (and cleared) by the next
// experimental.chat.system.transform firing.
let pendingContext: string | null = null;

interface ProjectRoot {
  worktree?: string | null;
  directory?: string | null;
  project?: { path?: string | null } | null;
}

function resolveProjectRoot(ctx: ProjectRoot): string {
  if (cachedRoot !== null) return cachedRoot;
  const seeds: string[] = [];
  if (ctx.worktree) seeds.push(ctx.worktree);
  if (ctx.directory) seeds.push(ctx.directory);
  if (ctx.project?.path) seeds.push(ctx.project.path);
  if (process.cwd()) seeds.push(process.cwd());
  for (const seed of seeds) {
    let dir = path.resolve(seed);
    for (let i = 0; i < 24; i++) {
      try {
        if (fs.existsSync(path.join(dir, '.caws'))) {
          cachedRoot = dir;
          return dir;
        }
      } catch {
        // ignore
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  cachedRoot = UNKNOWN_ROOT;
  return cachedRoot;
}

function mapToolName(opencodeTool: string): string {
  const map: Record<string, string> = {
    bash: 'Bash',
    write: 'Write',
    edit: 'Edit',
    read: 'Read',
    glob: 'Glob',
    grep: 'Grep',
    task: 'Task',
  };
  return map[opencodeTool] || opencodeTool;
}

function normalizeArgs(raw: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'filePath') out.file_path = v;
    else if (k === 'oldString') out.old_string = v;
    else if (k === 'newString') out.new_string = v;
    else out[k] = v;
  }
  return out;
}

interface DispatchResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function dispatch(root: string, dispatcher: string, payload: string): DispatchResult {
  const script = path.join(root, '.caws', 'hooks', 'dispatch', dispatcher);
  try {
    const res = spawnSync(script, [], {
      cwd: root,
      input: payload,
      env: { ...process.env, CAWS_AGENT_SURFACE: SURFACE, CAWS_PROJECT_DIR: root },
      encoding: 'utf8',
      timeout: 45000,
      maxBuffer: 8 * 1024 * 1024,
    });
    return {
      exitCode: res.status === null ? 0 : res.status,
      stdout: typeof res.stdout === 'string' ? res.stdout : '',
      stderr: typeof res.stderr === 'string' ? res.stderr : '',
    };
  } catch (e) {
    return { exitCode: 0, stdout: '', stderr: String(e instanceof Error ? e.message : e) };
  }
}

interface Decision {
  block: boolean;
  reason: string;
  warn: string;
  context: string;
  updatedInput: Record<string, unknown> | null;
}

// Extract every top-level {...} object from a string, respecting string
// literals (so braces inside a JSON string value don't trip depth tracking).
// The dispatcher's stdout contains one JSON object per handler, and jq-emitted
// objects (additionalContext) are pretty-printed across multiple lines — so a
// naive line-by-line parse misses them. This scans for balanced objects.
function extractJsonObjects(s: string): Record<string, any>[] {
  const objs: Record<string, any>[] = [];
  let i = 0;
  while (i < s.length) {
    const start = s.indexOf('{', i);
    if (start < 0) break;
    let depth = 0;
    let inStr = false;
    let esc = false;
    let end = -1;
    for (let j = start; j < s.length; j++) {
      const ch = s[j];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
      } else if (ch === '"') {
        inStr = true;
      } else if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) {
          end = j;
          break;
        }
      }
    }
    if (end < 0) break;
    try {
      objs.push(JSON.parse(s.slice(start, end + 1)));
    } catch {
      // not a valid object boundary; advance and continue
    }
    i = end + 1;
  }
  return objs;
}

// Interpret a shared dispatcher's stdout JSON + exit code. Aggregates every
// hookSpecificOutput.additionalContext across all emitted JSON objects (the
// heartbeat peer notice, inter-agent messages, advisory warns) into `context`,
// and captures the last updatedInput seen (a single rewrite per call).
function readDecision(stdout: string, exitCode: number): Decision {
  const empty: Decision = { block: false, reason: '', warn: '', context: '', updatedInput: null };
  for (const obj of extractJsonObjects(stdout)) {
    const decision = obj.decision;
    const hso = obj.hookSpecificOutput;
    const perm = hso?.permissionDecision;
    const reason =
      obj.reason || hso?.permissionDecisionReason || 'CAWS guard blocked this operation.';
    if (decision === 'block') return { block: true, reason, warn: '', context: '', updatedInput: null };
    if (perm === 'ask' || perm === 'deny') return { block: true, reason, warn: '', context: '', updatedInput: null };
    if (decision === 'warn' || (typeof obj.advisory === 'string' && obj.advisory)) {
      empty.warn = obj.advisory || reason;
    }
    const ac = hso?.additionalContext;
    if (typeof ac === 'string' && ac) {
      empty.context = empty.context ? empty.context + '\n\n' + ac : ac;
    }
    const ui = hso?.updatedInput ?? obj.updatedInput;
    if (ui && typeof ui === 'object') {
      empty.updatedInput = ui as Record<string, unknown>;
    }
  }
  if (exitCode === 2) {
    return {
      block: true,
      reason: stdout.trim() || 'CAWS guard blocked this operation (dispatcher exit 2).',
      warn: '',
      context: '',
      updatedInput: null,
    };
  }
  return empty;
}

function applyUpdatedInput(args: Record<string, unknown>, updated: Record<string, unknown>): void {
  if (typeof updated.command === 'string' && typeof args.command === 'string') {
    args.command = updated.command;
  }
}

interface ToolInput {
  tool?: string;
  sessionID?: string;
  [k: string]: unknown;
}

interface CawsClient {
  app?: {
    log?: (args: { body: { level: string; message: string; service?: string } }) => Promise<unknown>;
  };
}

function extractSessionId(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const candidates = [obj.sessionID, obj.id, obj.sessionId, obj.session?.id, obj.properties?.id, obj.properties?.session?.id];
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0 && c !== 'unknown') return c;
  }
  return null;
}

interface CawsPluginCtx {
  worktree?: string | null;
  directory?: string | null;
  project?: { path?: string | null } | null;
  client?: CawsClient;
}

function buildPayload(toolName: string, toolInput: Record<string, unknown>): string {
  return JSON.stringify({
    tool_name: toolName,
    tool_input: toolInput,
    tool_use_id: '',
    session_id: currentSessionId || '',
  });
}

async function advisoryLog(client: CawsClient | undefined, message: string) {
  if (!message) return;
  try {
    await client?.app?.log?.({ body: { level: 'warn', message, service: 'caws' } });
  } catch {
    // best-effort
  }
}

export const CawsPlugin = async (ctx: CawsPluginCtx) => {
  return {
    'tool.execute.before': async (input: ToolInput, output: { args: Record<string, unknown> }) => {
      try {
        const sidFromInput = extractSessionId(input);
        if (sidFromInput) currentSessionId = sidFromInput;

        const root = resolveProjectRoot(ctx);
        if (root === UNKNOWN_ROOT || !fs.existsSync(path.join(root, '.caws', 'hooks', 'dispatch'))) {
          if (!warnedMissing) {
            warnedMissing = true;
            await advisoryLog(
              ctx.client,
              'CAWS hook core not found at .caws/hooks/dispatch/ — run `caws init --agent-surface opencode`. Allowing tools (governance off).'
            );
          }
          return;
        }

        const toolName = mapToolName(input?.tool || '');
        const toolInput = normalizeArgs(output?.args);
        const payload = buildPayload(toolName, toolInput);

        const res = dispatch(root, 'pre_tool_use.sh', payload);
        const decision = readDecision(res.stdout, res.exitCode);
        if (decision.block) {
          throw new Error(decision.reason);
        }
        if (decision.updatedInput && output?.args && typeof output.args === 'object') {
          applyUpdatedInput(output.args, decision.updatedInput);
        }
        // Stash context for the next system.transform to inject. Combine warn +
        // additionalContext so advisories surface too.
        const combined = [decision.warn, decision.context].filter(Boolean).join('\n\n');
        if (combined) {
          pendingContext = combined;
        }
      } catch (e) {
        // A deliberate CAWS block must propagate; everything else fails open.
        if (e instanceof Error && /^CAWS/.test(e.message)) throw e;
      }
    },

    'tool.execute.after': async (input: ToolInput, output: { args: Record<string, unknown> }) => {
      try {
        const root = resolveProjectRoot(ctx);
        if (root === UNKNOWN_ROOT) return;
        const toolName = mapToolName(input?.tool || '');
        const toolInput = normalizeArgs(output?.args);
        const payload = buildPayload(toolName, toolInput);
        const res = dispatch(root, 'post_tool_use.sh', payload);
        const decision = readDecision(res.stdout, res.exitCode);
        const combined = [decision.warn, decision.context].filter(Boolean).join('\n\n');
        if (combined) {
          pendingContext = pendingContext ? pendingContext + '\n\n' + combined : combined;
        }
      } catch {
        // post-tool audit must never interfere with a completed tool call
      }
    },

    // Context injection: append stashed CAWS context to the system prompt
    // before the next model call. This is the type-confirmed injection point
    // (Hooks["experimental.chat.system.transform"] mutates output.system[]).
    'experimental.chat.system.transform': async (
      _input: { sessionID?: string; model?: unknown },
      output: { system: string[] }
    ) => {
      if (pendingContext) {
        output.system.push('CAWS context (peer notice / message / advisory):\n' + pendingContext);
        pendingContext = null;
      }
    },

    event: async (ev: { event?: { type?: string; properties?: any } } | undefined) => {
      try {
        const type = ev?.event?.type;
        const props = ev?.event?.properties;
        if (type && String(type).startsWith('session.')) {
          const sid = extractSessionId(props) || extractSessionId(props?.session);
          if (sid) currentSessionId = sid;
        }
        if (!type) return;
        const root = resolveProjectRoot(ctx);
        if (root === UNKNOWN_ROOT) return;
        let dispatcher: string | null = null;
        if (type === 'session.created') dispatcher = 'session_start.sh';
        else if (type === 'session.idle') dispatcher = 'stop.sh';
        else if (type === 'session.compacted') dispatcher = 'pre_compact.sh';
        if (!dispatcher) return;
        dispatch(root, dispatcher, JSON.stringify({ session_id: currentSessionId || '' }));
      } catch {
        // lifecycle hooks are advisory
      }
    },
  };
};

export default CawsPlugin;
