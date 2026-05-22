/**
 * Design Token Resolution Types
 *
 * Core type definitions for token resolution, transformation, and diagnostics.
 */

export type OutputFormat =
  | 'css-var-map' // { --btn-bg: "...", --btn-fg: "..." }
  | 'css-decl' // string of ":root{...}" or selector-scoped
  | 'js-literals' // { btnBg: "#fff", ... }
  | 'react-native' // { color: "rgba(...)", shadowOffset: {...} }
  | 'android'
  | 'ios'
  | 'ref-map';

/**
 * Configuration for the design token resolver.
 *
 * Supports both legacy token resolution and DTCG 1.0 Resolver Module.
 * When resolverDocumentPath is provided, uses the new resolver module.
 */
export interface ResolverConfig {
  /** Path to DTCG 1.0 resolver document. When provided, uses resolver module instead of legacy resolution. */
  resolverDocumentPath?: string;

  /** Pattern for matching token references. Default: /\{([^}]+)\}/g */
  referencePattern?: RegExp;

  /** Delimiter for fallback chains (e.g., "{tokenA} || {tokenB} || default"). Default: '||' */
  fallbackDelimiter?: string;

  /** Maximum recursion depth for token resolution. Default: 32 */
  maxDepth?: number;

  /** Theme context (e.g., 'light', 'dark'). Used for both legacy and resolver module. */
  theme?: string;

  /** Platform context (e.g., 'web', 'ios', 'android'). Used for both legacy and resolver module. */
  platform?: 'web' | 'ios' | 'android' | 'rn';

  /** Brand context. Used for both legacy and resolver module. */
  brand?: string;

  /** Output format for resolved tokens. */
  output?: OutputFormat;

  /** Prefix for CSS custom properties. Default: '--' */
  cssVarPrefix?: string;

  /** Casing convention for output names. */
  nameCase?: 'kebab' | 'camel' | 'pascal';

  /** Whether to include $type and $description in diagnostics. */
  includeMeta?: boolean;

  /** Whether to output CSS var() references instead of resolved values. Default: true */
  resolveToReferences?: boolean;

  /** Prefix for system-level tokens. Default: '--' */
  systemTokenPrefix?: string;

  /** Whether to emit nested var() fallbacks for reference chains. Default: true */
  emitVarFallbackChain?: boolean;

  /** Whether to emit only variable names with empty values. Default: false */
  emitVarsOnly?: boolean;

  /** Custom function to transform token paths to CSS variable names. */
  referenceNamespace?: (path: string) => string;

  /** CSS selector for scoped output (e.g., '.theme-dark'). */
  scopeSelector?: string;

  /** Transform pipeline applied during resolution. */
  transforms?: Transform[];

  /** Warning callback for diagnostics. */
  onWarn?: (d: Diagnostic) => void;

  /** Error callback for diagnostics. */
  onError?: (d: Diagnostic) => void;

  /** Whether to throw exceptions on errors instead of logging. Default: false */
  strict?: boolean;

  /** Number precision for numeric values (e.g., for LCH/OKLCH colors). */
  numberPrecision?: number;
  unitPreferences?: {
    dimension?: 'px' | 'rem';
    duration?: 'ms' | 's';
    color?: 'hex' | 'rgb' | 'hsl' | 'oklch';
  };

  // caching
  cache?: Map<string, string>;
}

export interface Transform {
  match: (ctx: ResolveContext) => boolean; // by $type or path
  apply: (value: unknown, ctx: ResolveContext) => unknown;
}

export interface ResolveContext {
  path: string; // 'semantic.color.bg.primary'
  node: unknown; // token node (may have $type, $value)
  tokens: Record<string, unknown>;
  config: ResolverConfig;
  theme?: string;
  platform?: string;
  brand?: string;
  type?: string; // $type from token node
}

export interface Diagnostic {
  code:
    | 'CIRCULAR'
    | 'MISSING'
    | 'TYPE_MISMATCH'
    | 'UNRESOLVED_FALLBACK'
    | 'DEPTH_EXCEEDED';
  path: string;
  message: string;
  hint?: string;
}

export class Diagnostics {
  list: Diagnostic[] = [];

  warn(d: Diagnostic) {
    this.list.push(d);
  }

  error(d: Diagnostic) {
    this.list.push(d);
  }

  hasErrors(): boolean {
    return this.list.some(
      (d) =>
        d.code === 'MISSING' ||
        d.code === 'TYPE_MISMATCH' ||
        d.code === 'DEPTH_EXCEEDED'
    );
  }

  clear() {
    this.list = [];
  }
}

export interface ComponentTokenConfig {
  prefix: string;
  tokens: Record<string, unknown>;
}
