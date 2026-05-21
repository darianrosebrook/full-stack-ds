/**
 * W3C Design Tokens Validator
 *
 * A generic, reusable validator for W3C Design Tokens Community Group (DTCG) 1.0 specification.
 * This validator can be used in any project without repository-specific dependencies.
 *
 * @author Darian Rosebrook (@darianrosebrook)
 * @see https://github.com/darianrosebrook
 *
 * @example
 * ```typescript
 * import { validateDesignTokens, setDefaultSchema } from './w3c-validator';
 * import schema from './w3c-schema-strict.json';
 *
 * // Set the schema (required before first use)
 * setDefaultSchema(schema);
 *
 * const result = validateDesignTokens({
 *   color: {
 *     primary: {
 *       $type: 'color',
 *       $value: { colorSpace: 'srgb', components: [1, 0, 0] }
 *     }
 *   }
 * });
 *
 * if (!result.isValid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */

import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

// Import schema - users can provide their own path or use the bundled schema
// For standalone usage, users should import the schema JSON file directly
let defaultSchema: object | null = null;
let schemaMode: 'strict' | 'permissive' | 'unknown' = 'unknown';

/**
 * Set the default schema to use for validation
 * Call this with your schema import if not using the bundled schema
 *
 * @example
 * ```typescript
 * import { setDefaultSchema } from './w3c-validator';
 * import schema from './w3c-schema-strict.json';
 * setDefaultSchema(schema);
 * ```
 */
export function setDefaultSchema(schema: object): void {
  defaultSchema = schema;

  // Detect schema mode by checking if it includes custom types
  const schemaStr = JSON.stringify(schema);
  const hasCustomTypes =
    /"opacity"|"spacing"|"radius"|"elevation"|"motion"|"layout"|"interaction"|"string"|"keyframes"|"composition"|"borderRadius"|"borderWidth"|"borderStyle"/.test(
      schemaStr
    );
  schemaMode = hasCustomTypes ? 'permissive' : 'strict';
}

/**
 * Get the default schema
 */
export function getDefaultSchema(): object | null {
  return defaultSchema;
}

/**
 * Try to load the schema from the default location
 * This is a convenience function that attempts to load w3c-schema.json
 * from the same directory. May fail in some bundler configurations.
 */
export async function loadDefaultSchema(): Promise<object | null> {
  if (defaultSchema) {
    return defaultSchema;
  }

  try {
    // Try to dynamically import the schema
    // This works in Node.js ESM and most bundlers
    const schemaModule = await import('./w3c-schema-strict.json');
    defaultSchema = schemaModule.default || schemaModule;
    return defaultSchema;
  } catch {
    // Schema not found or not importable
    // User should call setDefaultSchema() manually
    return null;
  }
}

/**
 * Validation error details
 */
export interface ValidationError {
  type: 'schema' | 'parse' | 'circular-reference' | 'custom';
  path: string;
  message: string;
  data?: unknown;
  schema?: unknown;
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  type: string;
  path: string;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  tokens: unknown;
}

/**
 * Options for validation
 */
export interface ValidationOptions {
  /**
   * Whether to perform custom validations beyond schema validation
   * @default true
   */
  customValidations?: boolean;
  /**
   * Whether to allow additional properties not defined in the schema
   * @default true
   */
  allowAdditionalProperties?: boolean;
  /**
   * Custom schema to use instead of the default W3C schema
   */
  customSchema?: object;
}

let schemaValidator: ValidateFunction | null = null;

/**
 * Initialize the AJV validator with the W3C schema
 */
function initializeValidator(
  options: ValidationOptions = {}
): ValidateFunction | null {
  if (schemaValidator && !options.customSchema) {
    return schemaValidator;
  }

  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
    allowUnionTypes: true,
  });

  addFormats(ajv);

  const schemaToUse = options.customSchema || defaultSchema;

  if (!schemaToUse) {
    console.error(
      '[validator] No schema provided. ' +
        'Use setDefaultSchema() or provide customSchema in options. ' +
        'Example: import schema from "./w3c-schema-strict.json"; setDefaultSchema(schema);'
    );
    return null;
  }

  try {
    schemaValidator = ajv.compile(schemaToUse);
    return schemaValidator;
  } catch (error) {
    console.error('[validator] Failed to compile schema:', error);
    return null;
  }
}

/**
 * Validate design tokens against the W3C DTCG 1.0 specification
 *
 * @param tokens - The design tokens object to validate
 * @param options - Validation options
 * @returns Validation result with errors and warnings
 */
export function validateDesignTokens(
  tokens: unknown,
  options: ValidationOptions = {}
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    tokens,
  };

  // Initialize validator
  const validator = initializeValidator(options);
  if (!validator) {
    result.isValid = false;
    result.errors.push({
      type: 'schema',
      path: 'root',
      message: 'Failed to initialize validator',
    });
    return result;
  }

  // Validate against schema
  const isSchemaValid = validator(tokens);

  if (!isSchemaValid) {
    result.isValid = false;
    result.errors.push(
      ...(validator.errors || []).map((error: ErrorObject) => ({
        type: 'schema' as const,
        path: error.instancePath || 'root',
        message: error.message || 'Validation error',
        data: error.data,
        schema: error.schema,
      }))
    );
  }

  // Perform custom validations if enabled
  if (options.customValidations !== false) {
    const customValidation = performCustomValidations(tokens);
    result.errors.push(...customValidation.errors);
    result.warnings.push(...customValidation.warnings);

    if (customValidation.errors.length > 0) {
      result.isValid = false;
    }
  }

  return result;
}

/**
 * Perform custom validation rules beyond schema validation
 */
function performCustomValidations(tokens: unknown): {
  errors: ValidationError[];
  warnings: ValidationWarning[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Track token references for circular dependency detection
  const tokenRefs = new Map<string, string>();

  function validateNode(node: unknown, path = ''): void {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      return;
    }

    const nodeObj = node as Record<string, unknown>;

    // Check if this is a token (has $value)
    if ('$value' in nodeObj) {
      validateToken(nodeObj, path);
    }

    // Check if this is a group (has $type but no $value)
    if ('$type' in nodeObj && !('$value' in nodeObj)) {
      validateGroup(nodeObj, path);
    }

    // Recursively validate children
    for (const [key, value] of Object.entries(nodeObj)) {
      if (!key.startsWith('$') && typeof value === 'object' && value !== null) {
        validateNode(value, path ? `${path}.${key}` : key);
      }
    }
  }

  function validateToken(token: Record<string, unknown>, path: string): void {
    // Check for required properties
    if (!token.$type && !token.$value) {
      warnings.push({
        type: 'missing-type',
        path,
        message: 'Token should have a $type property for better validation',
      });
    }

    // Validate token references
    if (typeof token.$value === 'string' && token.$value.match(/^\{[^}]+\}$/)) {
      const refPath = token.$value.slice(1, -1);
      tokenRefs.set(path, refPath);

      // Check for self-reference
      if (refPath === path) {
        errors.push({
          type: 'circular-reference',
          path,
          message: 'Token cannot reference itself',
        });
      }
    }

    // Type-specific validations
    if (token.$type) {
      validateTokenType(token, path);
    }
  }

  function validateGroup(group: Record<string, unknown>, path: string): void {
    // Groups should have meaningful names
    if (path.length === 0) {
      warnings.push({
        type: 'naming',
        path,
        message: 'Root level groups should have descriptive names',
      });
    }
  }

  function validateTokenType(
    token: Record<string, unknown>,
    path: string
  ): void {
    const $type = token.$type as string;
    const $value = token.$value;

    // Check for non-standard types (warn but don't error)
    // Only warn if using strict schema - permissive schema accepts custom types
    const standardTypes = [
      'color',
      'dimension',
      'fontFamily',
      'fontWeight',
      'duration',
      'cubicBezier',
      'number',
      'border',
      'transition',
      'shadow',
      'gradient',
      'typography',
      'strokeStyle',
    ];

    // Permissive schema types (from w3c-schema-permissive.json)
    const permissiveTypes = [
      ...standardTypes,
      'opacity',
      'spacing',
      'radius',
      'elevation',
      'motion',
      'layout',
      'interaction',
      'string',
      'keyframes',
    ];

    if ($type && !standardTypes.includes($type)) {
      // Only warn if using strict schema
      if (schemaMode === 'strict') {
        warnings.push({
          type: 'non-standard-type',
          path,
          message: `Non-standard token type "${$type}". Standard types are: ${standardTypes.join(', ')}`,
        });
      } else if (
        schemaMode === 'permissive' &&
        !permissiveTypes.includes($type)
      ) {
        // Warn about truly unknown types even in permissive mode
        warnings.push({
          type: 'unknown-type',
          path,
          message: `Unknown token type "${$type}". Permissive schema supports: ${permissiveTypes.join(', ')}`,
        });
      }
    }

    switch ($type) {
      case 'color':
        // Validate color value structure
        if (
          typeof $value === 'object' &&
          $value !== null &&
          !Array.isArray($value)
        ) {
          const colorValue = $value as Record<string, unknown>;
          if ('colorSpace' in colorValue) {
            const validColorSpaces = [
              'srgb',
              'srgb-linear',
              'display-p3',
              'a98-rgb',
              'prophoto-rgb',
              'rec2020',
              'xyz-d50',
              'xyz-d65',
              'oklab',
              'oklch',
              'lab',
              'lch',
            ];
            if (!validColorSpaces.includes(colorValue.colorSpace as string)) {
              errors.push({
                type: 'custom',
                path,
                message: `Invalid colorSpace: "${colorValue.colorSpace}". Must be one of: ${validColorSpaces.join(', ')}`,
              });
            }
          }
          if ('components' in colorValue) {
            const components = colorValue.components;
            if (
              !Array.isArray(components) ||
              components.length < 3 ||
              components.length > 4
            ) {
              errors.push({
                type: 'custom',
                path,
                message: 'Color components must be an array of 3-4 numbers',
              });
            }
          }
        } else if (
          typeof $value === 'string' &&
          !$value.match(/^(#|rgb|hsl|oklch|\{)/)
        ) {
          warnings.push({
            type: 'color-format',
            path,
            message:
              'Color value should be a valid CSS color or token reference',
          });
        }
        break;

      case 'dimension':
        // Validate dimension value structure
        if (
          typeof $value === 'object' &&
          $value !== null &&
          !Array.isArray($value)
        ) {
          const dimValue = $value as Record<string, unknown>;
          if (
            'unit' in dimValue &&
            !['px', 'rem'].includes(dimValue.unit as string)
          ) {
            errors.push({
              type: 'custom',
              path,
              message: `Invalid dimension unit: "${dimValue.unit}". Must be "px" or "rem"`,
            });
          }
          if ('value' in dimValue && typeof dimValue.value !== 'number') {
            errors.push({
              type: 'custom',
              path,
              message: 'Dimension value must be a number',
            });
          }
        } else if (
          typeof $value === 'string' &&
          !$value.match(/^([0-9.-]+(px|rem|em|%|vh|vw)|0|\{|calc\()/)
        ) {
          warnings.push({
            type: 'dimension-format',
            path,
            message:
              'Dimension value should include units or be a token reference',
          });
        }
        break;

      case 'number':
        // Handle nested $value structures (non-standard but common)
        if (
          typeof $value === 'object' &&
          $value !== null &&
          !Array.isArray($value)
        ) {
          const nestedValue = ($value as Record<string, unknown>).$value;
          if (nestedValue !== undefined) {
            warnings.push({
              type: 'nested-value',
              path,
              message: 'Nested $value structure detected. Consider flattening.',
            });
            // Validate the nested value
            if (
              typeof nestedValue !== 'number' &&
              typeof nestedValue !== 'string'
            ) {
              warnings.push({
                type: 'number-format',
                path: `${path}.$value.$value`,
                message:
                  'Nested number value should be numeric or a token reference',
              });
            }
          }
        } else if (
          typeof $value !== 'number' &&
          typeof $value === 'string' &&
          !$value.match(/^(\d+(\.\d+)?|\{)/)
        ) {
          warnings.push({
            type: 'number-format',
            path,
            message: 'Number value should be numeric or a token reference',
          });
        }
        break;

      // Handle non-standard types that might be used
      default:
        // For unknown types, just validate basic structure
        if ($value === undefined) {
          warnings.push({
            type: 'missing-value',
            path,
            message: `Token with type "${$type}" should have a $value property`,
          });
        }
        break;
    }
  }

  // Start validation from root
  validateNode(tokens);

  // Check for circular references
  const circularRefs = detectCircularReferences(tokenRefs);
  errors.push(
    ...circularRefs.map((cycle) => ({
      type: 'circular-reference' as const,
      path: cycle.join(' -> '),
      message: 'Circular reference detected in token chain',
    }))
  );

  return { errors, warnings };
}

/**
 * Detect circular references in token dependencies
 */
function detectCircularReferences(tokenRefs: Map<string, string>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string, path: string[] = []): void {
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart).concat(node));
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const reference = tokenRefs.get(node);
    if (reference) {
      dfs(reference, [...path]);
    }

    recursionStack.delete(node);
  }

  for (const node of tokenRefs.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
}

/**
 * Format validation results for console output
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.isValid && result.warnings.length === 0) {
    lines.push('✅ Design tokens are valid');
    return lines.join('\n');
  }

  if (result.warnings.length > 0) {
    lines.push(`⚠️  ${result.warnings.length} warning(s):`);
    result.warnings.forEach((warning) => {
      lines.push(
        `  Warning [${warning.type}] ${warning.path}: ${warning.message}`
      );
    });
  }

  if (!result.isValid) {
    lines.push(`❌ ${result.errors.length} error(s):`);
    result.errors.forEach((error) => {
      lines.push(`  Error [${error.type}] ${error.path}: ${error.message}`);
    });
  }

  return lines.join('\n');
}

/**
 * Validate design tokens from a JSON file
 *
 * @param filePath - Path to the JSON file containing design tokens
 * @param options - Validation options
 * @returns Validation result
 */
export async function validateDesignTokensFromFile(
  filePath: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    const tokens = JSON.parse(content);
    return validateDesignTokens(tokens, options);
  } catch (error) {
    const err = error as Error;
    return {
      isValid: false,
      errors: [
        {
          type: 'parse',
          path: 'file',
          message: `Failed to read or parse file: ${err.message}`,
        },
      ],
      warnings: [],
      tokens: null,
    };
  }
}
