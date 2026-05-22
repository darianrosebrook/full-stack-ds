/**
 * Design Tokens Resolver Module
 *
 * DTCG-inspired resolver for set resolution, modifier cascades, alias resolution,
 * and JSON Pointer references. Does not claim full DTCG Resolver Module conformance.
 * See test/utils/designTokens/resolver/ for what is proven.
 *
 * @author @darianrosebrook
 */

import fs from 'fs';
import path from 'path';
import { getNestedValue } from './pathUtils';
import type { Diagnostic } from './types';

/**
 * Reference object for JSON Pointer syntax
 * @see https://www.designtokens.org/tr/2025.10/resolver/#reference-objects
 */
export interface ReferenceObject {
  $ref: string; // JSON Pointer (e.g., "#/sets/foundation" or "foundation/colors.json")
}

/**
 * Reference path - a string, number, or symbol
 */
export type ReferencePath = string | number | symbol;

/**
 * Set definition - a collection of design tokens
 * @see https://www.designtokens.org/tr/2025.10/resolver/#sets
 */
export interface Set {
  sources: Array<ReferenceObject | Record<string, unknown>>;
  description?: string;
}

/**
 * Modifier context - defines values for a specific context (e.g., "light" theme)
 * @see https://www.designtokens.org/tr/2025.10/resolver/#modifiers
 */
export interface ModifierContext {
  sources: Array<ReferenceObject | Record<string, unknown>>;
  description?: string;
}

/**
 * Modifier definition - defines contexts for different values
 * @see https://www.designtokens.org/tr/2025.10/resolver/#modifiers
 */
export interface Modifier {
  contexts: Record<string, ModifierContext>;
  description?: string;
  default?: string; // Default context value
  resolutionCount?: number; // Number of contexts to resolve
}

/**
 * Resolution order item - can reference a set or modifier
 * @see https://www.designtokens.org/tr/2025.10/resolver/#resolution-order
 */
export type ResolutionOrderItem = ReferenceObject | Set | Modifier;

/**
 * Resolver document root structure
 * @see https://www.designtokens.org/tr/2025.10/resolver/#root-level-properties
 */
export interface ResolverDocument {
  name?: string;
  version: string; // MUST be "2025-10-01"
  description?: string;
  sets: Record<string, Set>;
  modifiers: Record<string, Modifier>;
  resolutionOrder: ResolutionOrderItem[];
  $defs?: Record<string, unknown>; // Optional definitions for bundling
  $extensions?: Record<string, unknown>; // Custom extensions
}

/**
 * Input for resolution - defines which modifier contexts to use
 * @see https://www.designtokens.org/tr/2025.10/resolver/#inputs
 */
export interface ResolutionInput {
  [modifierName: string]: string; // e.g., { theme: "light", brand: "brandA" }
}

/**
 * Resolved token set - the final flattened tokens after resolution
 */
export interface ResolvedTokens {
  tokens: Record<string, unknown>;
  diagnostics: Diagnostic[];
}

/**
 * Options for resolver initialization
 */
export interface ResolverOptions {
  basePath?: string; // Base directory for resolving file references
  fileResolver?: (ref: string) => Record<string, unknown> | null; // Custom file resolver
  onWarn?: (d: Diagnostic) => void;
  onError?: (d: Diagnostic) => void;
  strict?: boolean; // Throw on errors
}

/**
 * Main Resolver class implementing the DTCG 1.0 Resolver Module specification
 */
export class Resolver {
  private document: ResolverDocument;
  private options: Required<ResolverOptions>;
  private diagnostics: Diagnostic[] = [];
  private fileCache: Map<string, Record<string, unknown>> = new Map();

  /**
   * Create a new Resolver instance.
   *
   * @param document - Valid DTCG 1.0 resolver document
   * @param options - Configuration options for resolver behavior
   *
   * @example
   * ```typescript
   * const resolver = new Resolver(document, {
   *   basePath: './tokens',
   *   onWarn: console.warn,
   *   strict: true
   * });
   * ```
   */
  constructor(document: ResolverDocument, options: ResolverOptions = {}) {
    this.document = document;
    this.options = {
      basePath: options.basePath ?? process.cwd(),
      fileResolver: options.fileResolver ?? this.defaultFileResolver.bind(this),
      onWarn: options.onWarn ?? (() => {}),
      onError: options.onError ?? (() => {}),
      strict: options.strict ?? false,
    };

    // Validate document
    this.validateDocument();

    if (this.options.strict && this.hasErrors()) {
      throw new Error('Invalid resolver document');
    }
  }

  /**
   * Validate the resolver document structure
   */
  private validateDocument(): void {
    if (!this.document.version) {
      this.error({
        code: 'MISSING',
        path: '/version',
        message: 'Resolver document must have a version property',
        hint: 'Set version to "2025-10-01"',
      });
      return;
    }

    if (this.document.version !== '2025-10-01') {
      this.error({
        code: 'TYPE_MISMATCH',
        path: '/version',
        message: `Invalid version: ${this.document.version}. Must be "2025-10-01"`,
        hint: 'Update version to "2025-10-01"',
      });
    }

    if (
      !this.document.resolutionOrder ||
      !Array.isArray(this.document.resolutionOrder)
    ) {
      this.error({
        code: 'MISSING',
        path: '/resolutionOrder',
        message: 'Resolver document must have a resolutionOrder array',
        hint: 'Define the order of sets and modifiers to apply',
      });
    }

    if (!this.document.sets) {
      this.document.sets = {};
    }

    if (!this.document.modifiers) {
      this.document.modifiers = {};
    }
  }

  /**
   * Resolve tokens for a given input (modifier contexts)
   * @see https://www.designtokens.org/tr/2025.10/resolver/#resolution-logic
   */
  /**
   * Resolve tokens according to the DTCG 1.0 Resolver Module specification.
   *
   * Processes all sets and modifiers in resolutionOrder, applying the specified
   * input contexts (themes, brands, platforms) to produce a final token tree.
   *
   * @param input - Context values for modifier resolution (e.g., {theme: 'dark'})
   * @returns Resolved tokens and diagnostics from the resolution process
   *
   * @example
   * ```typescript
   * const result = resolver.resolve({ theme: 'dark', brand: 'premium' });
   * console.log(result.tokens); // Final resolved token tree
   * console.log(result.diagnostics); // Any warnings/errors encountered
   * ```
   */
  resolve(input: ResolutionInput = {}): ResolvedTokens {
    this.diagnostics = [];

    // Step 1: Input validation
    this.validateInput(input);

    if (this.hasErrors() && this.options.strict) {
      throw new Error('Input validation failed');
    }

    // Step 2: Resolve sets first (base tokens)
    const baseTokens = this.resolveSets();

    // Step 3: Apply modifiers in resolution order
    const resolvedTokens = this.applyModifiers(baseTokens, input);

    // Step 4: Resolve aliases
    const finalTokens = this.resolveAliases(resolvedTokens);

    return {
      tokens: finalTokens,
      diagnostics: [...this.diagnostics],
    };
  }

  /**
   * Validate input against defined modifiers
   * @see https://www.designtokens.org/tr/2025.10/resolver/#input-validation
   */
  private validateInput(input: ResolutionInput): void {
    for (const [modifierName, contextValue] of Object.entries(input)) {
      const modifier = this.document.modifiers[modifierName];
      if (!modifier) {
        this.warn({
          code: 'MISSING',
          path: `/modifiers/${modifierName}`,
          message: `Unknown modifier: ${modifierName}`,
          hint: 'Modifier must be defined in the resolver document',
        });
        continue;
      }

      if (!modifier.contexts[contextValue]) {
        this.error({
          code: 'TYPE_MISMATCH',
          path: `/modifiers/${modifierName}/contexts/${contextValue}`,
          message: `Invalid context value "${contextValue}" for modifier "${modifierName}"`,
          hint: `Available contexts: ${Object.keys(modifier.contexts).join(', ')}`,
        });
      }
    }
  }

  /**
   * Resolve all sets into a flattened token collection
   */
  private resolveSets(): Record<string, unknown> {
    const tokens: Record<string, unknown> = {};

    // Collect all sets referenced in resolutionOrder
    const setsToResolve = new Set<string>();
    for (const item of this.document.resolutionOrder) {
      if (this.isReferenceToSet(item)) {
        const setName = this.getReferenceTarget(item as ReferenceObject);
        if (setName && setName.startsWith('/sets/')) {
          setsToResolve.add(setName.replace('/sets/', ''));
        }
      }
    }

    // Resolve each set
    for (const setName of setsToResolve) {
      const set = this.document.sets[setName];
      if (!set) continue;

      const setTokens = this.resolveSetSources(set.sources);
      this.mergeTokens(tokens, setTokens);
    }

    return tokens;
  }

  /**
   * Resolve sources from a set or modifier context
   */
  private resolveSetSources(
    sources: Array<ReferenceObject | Record<string, unknown>>
  ): Record<string, unknown> {
    const tokens: Record<string, unknown> = {};

    for (const source of sources) {
      if (this.isReference(source)) {
        const resolved = this.resolveReference(source as ReferenceObject);
        if (resolved) {
          this.mergeTokens(tokens, resolved);
        }
      } else {
        // Inline token object
        this.mergeTokens(tokens, source as Record<string, unknown>);
      }
    }

    return tokens;
  }

  /**
   * Apply modifiers based on input
   */
  private applyModifiers(
    baseTokens: Record<string, unknown>,
    input: ResolutionInput
  ): Record<string, unknown> {
    const tokens = { ...baseTokens };

    // Apply modifiers in resolution order
    for (const item of this.document.resolutionOrder) {
      if (this.isReferenceToModifier(item)) {
        const modifierName = this.getReferenceTarget(item as ReferenceObject);
        if (modifierName && modifierName.startsWith('/modifiers/')) {
          const name = modifierName.replace('/modifiers/', '');
          const modifier = this.document.modifiers[name];
          const providedValue = input[name];
          const contextValue =
            providedValue !== undefined && modifier.contexts[providedValue]
              ? providedValue
              : modifier.default;

          if (contextValue && modifier.contexts[contextValue]) {
            const context = modifier.contexts[contextValue];
            const contextTokens = this.resolveSetSources(context.sources);
            // Later values override earlier ones
            this.mergeTokens(tokens, contextTokens);
          }
        }
      }
    }

    return tokens;
  }

  /**
   * Resolve aliases (token references)
   */
  private resolveAliases(
    tokens: Record<string, unknown>
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};
    const visited: any = new Set();

    for (const [path, value] of Object.entries(tokens)) {
      resolved[path] = this.resolveAliasRecursive(value, tokens, visited, path);
    }

    return resolved;
  }

  /**
   * Recursively resolve aliases
   */
  private resolveAliasRecursive(
    value: unknown,
    tokens: Record<string, unknown>,
    visited: any,
    currentPath: ReferencePath
  ): unknown {
    if (typeof value === 'string' && value.match(/^\{[^}]+\}$/)) {
      const aliasPath = value.slice(1, -1);
      if (visited.has(aliasPath)) {
        this.warn({
          code: 'CIRCULAR',
          path: String(currentPath),
          message: `Circular reference detected: ${String(currentPath)} -> ${String(aliasPath)}`,
          hint: 'Check for circular dependencies in token definitions',
        });
        return value;
      }

      // Check if the referenced token exists using nested path lookup
      // Tokens are stored as nested objects, so we need to check the nested structure
      const referencedValue = getNestedValue(
        tokens as Record<string, unknown>,
        aliasPath
      );
      if (referencedValue === undefined) {
        this.warn({
          code: 'MISSING',
          path: String(currentPath),
          message: `Token reference not found: ${aliasPath}`,
          hint: `Referenced token "${aliasPath}" does not exist in resolved tokens`,
        });
        // Preserve the reference string so CSS generator can convert it to var()
        // This allows tokens with unresolved references to still be included
        return value;
      }

      visited.add(aliasPath);
      const resolved = this.resolveAliasRecursive(
        referencedValue,
        tokens,
        visited,
        aliasPath
      );
      visited.delete(aliasPath);

      // If resolution resulted in undefined, preserve the original reference string
      // This allows tokens with unresolved references to still be included
      if (resolved === undefined) {
        return value;
      }

      // If the resolved value is a token object (has $value), extract just the $value
      // This prevents nested $value structures when resolving token references
      if (
        typeof resolved === 'object' &&
        resolved !== null &&
        '$value' in (resolved as Record<string, unknown>)
      ) {
        return (resolved as Record<string, unknown>).$value;
      }

      return resolved;
    }

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map((item) =>
          this.resolveAliasRecursive(item, tokens, visited, currentPath)
        );
      }

      const resolved: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(
        value as Record<string, unknown>
      )) {
        resolved[key] = this.resolveAliasRecursive(
          val,
          tokens,
          visited,
          `${String(currentPath)}.${key}`
        );
      }
      return resolved;
    }

    return value;
  }

  /**
   * Resolve a JSON Pointer reference
   */
  private resolveReference(
    ref: ReferenceObject
  ): Record<string, unknown> | null {
    const pointer = ref.$ref;

    // Handle JSON Pointer syntax
    if (pointer.startsWith('#')) {
      return this.resolveJSONPointer(pointer.slice(1));
    }

    // Handle file references
    return this.options.fileResolver(pointer);
  }

  /**
   * Resolve JSON Pointer (e.g., "/sets/foundation" or "/modifiers/theme")
   */
  private resolveJSONPointer(pointer: string): Record<string, unknown> | null {
    const parts = pointer.split('/').filter((p) => p);
    let current: unknown = this.document;

    for (const part of parts) {
      const decoded = part.replace(/~1/g, '/').replace(/~0/g, '~');
      if (
        current &&
        typeof current === 'object' &&
        decoded in (current as Record<string, unknown>)
      ) {
        current = (current as Record<string, unknown>)[decoded];
      } else {
        return null;
      }
    }

    // If it's a set, resolve its sources
    if (parts[0] === 'sets' && parts.length === 2) {
      const setName = parts[1];
      const set = this.document.sets[setName];
      if (set) {
        return this.resolveSetSources(set.sources);
      }
    }

    // If it's a modifier context, return null (should be handled by applyModifiers)
    if (parts[0] === 'modifiers') {
      return null;
    }

    // If it's $defs, return the definition
    if (parts[0] === '$defs') {
      return current as Record<string, unknown>;
    }

    return current as Record<string, unknown>;
  }

  /**
   * Default file resolver
   */
  private defaultFileResolver(ref: string): Record<string, unknown> | null {
    // Check cache
    if (this.fileCache.has(ref)) {
      return this.fileCache.get(ref)!;
    }

    const filePath = path.resolve(this.options.basePath, ref);
    if (!fs.existsSync(filePath)) {
      this.error({
        code: 'MISSING',
        path: ref,
        message: `File not found: ${ref}`,
        hint: `Expected file at: ${filePath}`,
      });
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      this.fileCache.set(ref, parsed);
      return parsed;
    } catch (error) {
      this.error({
        code: 'TYPE_MISMATCH',
        path: ref,
        message: `Failed to parse file: ${ref}`,
        hint: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Merge tokens (later values override earlier ones)
   */
  private mergeTokens(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): void {
    for (const [key, value] of Object.entries(source)) {
      if (
        key in target &&
        typeof target[key] === 'object' &&
        typeof value === 'object' &&
        !Array.isArray(target[key]) &&
        !Array.isArray(value) &&
        target[key] !== null &&
        value !== null
      ) {
        // Deep merge objects
        this.mergeTokens(
          target[key] as Record<string, unknown>,
          value as Record<string, unknown>
        );
      } else {
        // Overwrite with new value
        target[key] = value;
      }
    }
  }

  /**
   * Check if value is a reference object
   */
  private isReference(value: unknown): value is ReferenceObject {
    return (
      typeof value === 'object' &&
      value !== null &&
      '$ref' in value &&
      typeof (value as ReferenceObject).$ref === 'string'
    );
  }

  /**
   * Check if reference points to a set
   */
  private isReferenceToSet(item: ResolutionOrderItem): boolean {
    if (!this.isReference(item)) return false;
    return item.$ref.startsWith('#/sets/') || item.$ref.startsWith('/sets/');
  }

  /**
   * Check if reference points to a modifier
   */
  private isReferenceToModifier(item: ResolutionOrderItem): boolean {
    if (!this.isReference(item)) return false;
    return (
      item.$ref.startsWith('#/modifiers/') ||
      item.$ref.startsWith('/modifiers/')
    );
  }

  /**
   * Get target of a reference
   */
  private getReferenceTarget(ref: ReferenceObject): string | null {
    if (ref.$ref.startsWith('#')) {
      return ref.$ref.slice(1);
    }
    return ref.$ref;
  }

  /**
   * Check if resolver has errors
   */
  private hasErrors(): boolean {
    return this.diagnostics.some(
      (d) =>
        d.code === 'MISSING' ||
        d.code === 'TYPE_MISMATCH' ||
        d.code === 'DEPTH_EXCEEDED'
    );
  }

  /**
   * Add warning diagnostic
   */
  private warn(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
    this.options.onWarn(diagnostic);
  }

  /**
   * Add error diagnostic
   */
  private error(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
    this.options.onError(diagnostic);
  }
}

/**
 * Load and parse a resolver document from a file
 */
export function loadResolverDocument(
  filePath: string
): ResolverDocument | null {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`[resolver] File not found: ${filePath}`);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);

    // Validate basic structure
    if (!parsed.version || !parsed.resolutionOrder) {
      console.error('[resolver] Invalid resolver document structure');
      return null;
    }

    return parsed as ResolverDocument;
  } catch (error) {
    console.error(`[resolver] Failed to load resolver document: ${error}`);
    return null;
  }
}
