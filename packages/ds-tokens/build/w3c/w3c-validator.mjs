#!/usr/bin/env node

/**
 * W3C Design Tokens Validator CLI
 *
 * Command-line interface for validating design token files against the W3C DTCG 1.0 specification.
 *
 * Usage:
 *   node w3c-validator.mjs <file-or-directory>
 *
 * Example:
 *   node w3c-validator.mjs tokens.json
 *   node w3c-validator.mjs ./tokens/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse command-line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    strict: false,
    schema: process.env.W3C_SCHEMA || 'w3c-schema-strict.json',
    target: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--strict' || arg === '-s') {
      options.strict = true;
    } else if (arg === '--permissive' || arg === '-p') {
      options.schema = 'w3c-schema-permissive.json';
    } else if (arg === '--schema' && i + 1 < args.length) {
      options.schema = args[++i];
    } else if (!arg.startsWith('-')) {
      options.target = arg;
    }
  }

  return options;
}

/**
 * Initialize validator with options
 */
function createValidator(options = {}) {
  const {
    strict = false,
    schema: schemaName = process.env.W3C_SCHEMA || 'w3c-schema-strict.json',
  } = options;

  // Load schema
  const SCHEMA_PATH = path.join(__dirname, schemaName);
  let schema;
  try {
    const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf8');
    schema = JSON.parse(schemaContent);
  } catch (error) {
    console.error(`[validator] Failed to load schema from ${SCHEMA_PATH}`);
    console.error(`[validator] Error: ${error.message}`);
    process.exit(1);
  }

  // Initialize validator
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: strict,
    allowUnionTypes: true,
  });

  addFormats(ajv);
  const validate = ajv.compile(schema);

  return { validate, schema, strict };
}

/**
 * Validate a token file against the schema
 */
function validateTokenFile(
  filePath,
  validator,
  schemaPath = null,
  strictMode = false
) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    tokens: null,
    filePath,
    stats: null,
  };

  try {
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const tokens = JSON.parse(fileContent);
    result.tokens = tokens;

    // Validate against schema
    const isSchemaValid = validator.validate(tokens);

    if (!isSchemaValid) {
      result.isValid = false;
      // Deduplicate and simplify schema errors
      // Group errors by path and pick the most relevant one
      const errorsByPath = new Map();
      for (const error of validator.validate.errors || []) {
        const path = error.instancePath || 'root';
        if (!errorsByPath.has(path)) {
          errorsByPath.set(path, []);
        }
        errorsByPath.get(path).push(error);
      }

      // For each path, pick the most actionable error
      for (const [path, errors] of errorsByPath) {
        // Prioritize additionalProperties errors as they're most actionable
        const additionalPropsError = errors.find(
          (e) => e.keyword === 'additionalProperties'
        );
        // Also check for oneOf failures at the end
        const oneOfError = errors.find((e) => e.keyword === 'oneOf');

        if (additionalPropsError) {
          // Find what the additional property is
          const additionalProp =
            additionalPropsError.params?.additionalProperty;
          result.errors.push({
            type: 'schema',
            path,
            message: additionalProp
              ? `Additional property "${additionalProp}" not allowed`
              : 'Additional properties not allowed',
            data: additionalPropsError.data,
          });
        } else if (oneOfError && errors.length > 5) {
          // If there are many errors and a oneOf failure, just report the oneOf
          result.errors.push({
            type: 'schema',
            path,
            message: 'Value does not match any allowed type',
            data: oneOfError.data,
          });
        } else {
          // Report first error only for this path
          const firstError = errors[0];
          result.errors.push({
            type: 'schema',
            path,
            message: firstError.message,
            data: firstError.data,
          });
        }
      }
    }

    // Additional custom validations
    const customValidation = performCustomValidations(
      tokens,
      filePath,
      schemaPath,
      strictMode
    );
    result.errors.push(...customValidation.errors);
    result.warnings.push(...customValidation.warnings);
    result.stats = customValidation.stats;

    if (customValidation.errors.length > 0) {
      result.isValid = false;
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push({
      type: 'parse',
      path: 'file',
      message: `Failed to parse JSON: ${error.message}`,
      data: null,
    });
  }

  return result;
}

/**
 * Perform custom validation rules beyond schema validation
 */
function performCustomValidations(
  tokens,
  filePath,
  schemaPath = null,
  strictMode = false
) {
  const errors = [];
  const warnings = [];

  // Track token references for circular dependency detection
  const tokenRefs = new Map();
  const visited = new Set();

  // Track optional properties used (for strict mode reporting)
  const optionalPropsUsed = {
    color: { alpha: 0, hex: 0 },
    shadow: { inset: 0 },
    typography: { fontWeight: 0, letterSpacing: 0, lineHeight: 0 },
    transition: { delay: 0 },
    gradient: { position: 0 },
    token: { $description: 0, $deprecated: 0, $extensions: 0 },
    group: { $description: 0, $extensions: 0 },
  };
  let totalTokens = 0;
  let totalGroups = 0;

  // DTCG 2025.10 allowed properties per type (Section 4.1)
  const allowedProps = {
    colorValue: new Set(['colorSpace', 'components', 'alpha', 'hex']),
    dimensionValue: new Set(['value', 'unit']),
    shadowValue: new Set([
      'offsetX',
      'offsetY',
      'blur',
      'spread',
      'color',
      'inset',
    ]),
    typographyValue: new Set([
      'fontFamily',
      'fontSize',
      'fontWeight',
      'letterSpacing',
      'lineHeight',
    ]),
    borderValue: new Set(['color', 'width', 'style']),
    transitionValue: new Set(['duration', 'delay', 'timingFunction']),
    strokeStyleObject: new Set(['dashArray', 'lineCap']),
    gradientStop: new Set(['color', 'position']),
    token: new Set([
      '$value',
      '$type',
      '$description',
      '$deprecated',
      '$extensions',
    ]),
    group: new Set(['$type', '$description', '$extensions']),
  };

  function validateNode(node, path = '') {
    if (!node || typeof node !== 'object') return;

    // Check if this is a token (has $value)
    if (node.$value !== undefined) {
      validateToken(node, path);
    }

    // Check if this is a group (has $type but no $value)
    if (node.$type && node.$value === undefined) {
      validateGroup(node, path);
    }

    // Recursively validate children
    for (const [key, value] of Object.entries(node)) {
      if (!key.startsWith('$') && typeof value === 'object') {
        validateNode(value, path ? `${path}.${key}` : key);
      }
    }
  }

  function validateToken(token, path) {
    totalTokens++;

    // Track optional token-level properties
    if (token.$description !== undefined)
      optionalPropsUsed.token.$description++;
    if (token.$deprecated !== undefined) optionalPropsUsed.token.$deprecated++;
    if (token.$extensions !== undefined) optionalPropsUsed.token.$extensions++;

    // Check for required properties
    if (!token.$type && !token.$value) {
      warnings.push({
        type: 'missing-type',
        path,
        message: 'Token should have a $type property for better validation',
      });
    }

    // In strict mode, check for additional properties on token
    if (strictMode) {
      const tokenProps = Object.keys(token);
      const additionalTokenProps = tokenProps.filter(
        (key) => !allowedProps.token.has(key) && !key.startsWith('$')
      );
      // Check for non-standard $ properties
      const nonStandardDollarProps = tokenProps.filter(
        (key) => key.startsWith('$') && !allowedProps.token.has(key)
      );
      if (nonStandardDollarProps.length > 0) {
        errors.push({
          type: 'additional-properties',
          path,
          message: `Non-standard $-prefixed properties should be in $extensions: ${nonStandardDollarProps.join(', ')}`,
        });
      }
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

  function validateGroup(group, path) {
    totalGroups++;

    // Track optional group-level properties
    if (group.$description !== undefined)
      optionalPropsUsed.group.$description++;
    if (group.$extensions !== undefined) optionalPropsUsed.group.$extensions++;

    // Groups should have meaningful names
    if (path.length === 0) {
      warnings.push({
        type: 'naming',
        path,
        message: 'Root level groups should have descriptive names',
      });
    }

    // In strict mode, check for non-standard $ properties on groups
    if (strictMode) {
      const groupProps = Object.keys(group).filter((key) =>
        key.startsWith('$')
      );
      const nonStandardDollarProps = groupProps.filter(
        (key) => !allowedProps.group.has(key)
      );
      if (nonStandardDollarProps.length > 0) {
        errors.push({
          type: 'additional-properties',
          path,
          message: `Non-standard $-prefixed properties on group should be in $extensions: ${nonStandardDollarProps.join(', ')}`,
        });
      }
    }
  }

  function validateTokenType(token, path) {
    const { $type, $value } = token;

    // Detect schema mode from schema file name
    const isPermissive = schemaPath ? schemaPath.includes('permissive') : false;

    // Check for non-standard types (warn but don't error)
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

    // Permissive schema types
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
      if (!isPermissive) {
        warnings.push({
          type: 'non-standard-type',
          path,
          message: `Non-standard token type "${$type}". Standard types are: ${standardTypes.join(', ')}`,
        });
      } else if (!permissiveTypes.includes($type)) {
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
          const colorValue = $value;

          // Track optional color properties
          if ('alpha' in colorValue) optionalPropsUsed.color.alpha++;
          if ('hex' in colorValue) optionalPropsUsed.color.hex++;

          if ('colorSpace' in colorValue) {
            // Color spaces per DTCG 2025.10 Color Module (Section 4.2)
            const validColorSpaces = [
              'srgb',
              'srgb-linear',
              'hsl',
              'hwb',
              'lab',
              'lch',
              'oklab',
              'oklch',
              'display-p3',
              'a98-rgb',
              'prophoto-rgb',
              'rec2020',
              'xyz-d65',
              'xyz-d50',
            ];
            if (!validColorSpaces.includes(colorValue.colorSpace)) {
              errors.push({
                type: 'custom',
                path,
                message: `Invalid colorSpace: "${colorValue.colorSpace}". Must be one of: ${validColorSpaces.join(', ')}`,
              });
            }
          }
          if ('components' in colorValue) {
            const components = colorValue.components;
            if (!Array.isArray(components) || components.length !== 3) {
              errors.push({
                type: 'custom',
                path,
                message:
                  'Color components must be an array of exactly 3 values (numbers or "none")',
              });
            } else {
              // Validate each component is a number or "none" (Section 4.1.1)
              for (let i = 0; i < components.length; i++) {
                const comp = components[i];
                if (typeof comp !== 'number' && comp !== 'none') {
                  errors.push({
                    type: 'custom',
                    path,
                    message: `Component ${i} must be a number or "none", got ${typeof comp}`,
                  });
                }
              }
            }
          }

          // Validate hex format if present (Section 4.1)
          if ('hex' in colorValue && typeof colorValue.hex === 'string') {
            if (!/^#[0-9A-Fa-f]{6}$/.test(colorValue.hex)) {
              errors.push({
                type: 'custom',
                path,
                message: `hex must be in 6-digit CSS hex notation (e.g., "#ff00ff"), got "${colorValue.hex}"`,
              });
            }
          }

          // In strict mode, check for additional properties not allowed by DTCG 2025.10
          if (strictMode) {
            const additionalProps = Object.keys(colorValue).filter(
              (key) => !allowedProps.colorValue.has(key)
            );
            if (additionalProps.length > 0) {
              errors.push({
                type: 'additional-properties',
                path: `${path}.$value`,
                message: `Additional properties not allowed in strict mode: ${additionalProps.join(', ')}. DTCG 2025.10 only allows: ${Array.from(allowedProps.colorValue).join(', ')}`,
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
          const dimValue = $value;
          if ('unit' in dimValue && !['px', 'rem'].includes(dimValue.unit)) {
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

          // In strict mode, check for additional properties
          if (strictMode) {
            const additionalProps = Object.keys(dimValue).filter(
              (key) => !allowedProps.dimensionValue.has(key)
            );
            if (additionalProps.length > 0) {
              errors.push({
                type: 'additional-properties',
                path: `${path}.$value`,
                message: `Additional properties not allowed: ${additionalProps.join(', ')}. DTCG 2025.10 only allows: ${Array.from(allowedProps.dimensionValue).join(', ')}`,
              });
            }
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
          const nestedValue = $value.$value;
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
      type: 'circular-reference',
      path: cycle.join(' -> '),
      message: 'Circular reference detected in token chain',
    }))
  );

  // Build stats object
  const stats = {
    totalTokens,
    totalGroups,
    optionalPropsUsed,
  };

  return { errors, warnings, stats };
}

/**
 * Detect circular references in token dependencies
 */
function detectCircularReferences(tokenRefs) {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node, path = []) {
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
 * Log validation results in a user-friendly format
 */
function logValidationResult(result, strictMode = false) {
  const { isValid, errors, warnings, filePath, stats } = result;
  const fileName = path.basename(filePath);

  if (isValid && warnings.length === 0) {
    console.log(`[validator] ✅ ${fileName} - Valid`);
  } else {
    if (warnings.length > 0) {
      console.log(
        `[validator] ⚠️  ${fileName} - ${warnings.length} warning(s)`
      );
      warnings.forEach((warning) => {
        console.log(
          `  Warning [${warning.type}] ${warning.path}: ${warning.message}`
        );
      });
    }

    if (!isValid) {
      console.log(`[validator] ❌ ${fileName} - ${errors.length} error(s)`);
      errors.forEach((error) => {
        console.log(`  Error [${error.type}] ${error.path}: ${error.message}`);
      });
    }
  }

  // In strict mode, show optional property usage stats
  if (strictMode && stats) {
    logOptionalPropsStats(stats);
  }
}

/**
 * Log optional properties usage statistics
 */
function logOptionalPropsStats(stats) {
  const { totalTokens, totalGroups, optionalPropsUsed } = stats;

  console.log('\n[validator] 📊 Optional Properties Usage (DTCG 2025.10):');
  console.log(`  Tokens: ${totalTokens}, Groups: ${totalGroups}`);

  // Color optional props
  const colorOptional = optionalPropsUsed.color;
  if (colorOptional.alpha > 0 || colorOptional.hex > 0) {
    console.log('  Color:');
    if (colorOptional.alpha > 0)
      console.log(`    • alpha: ${colorOptional.alpha} token(s)`);
    if (colorOptional.hex > 0)
      console.log(`    • hex (fallback): ${colorOptional.hex} token(s)`);
  }

  // Shadow optional props
  const shadowOptional = optionalPropsUsed.shadow;
  if (shadowOptional.inset > 0) {
    console.log('  Shadow:');
    console.log(`    • inset: ${shadowOptional.inset} token(s)`);
  }

  // Typography optional props
  const typoOptional = optionalPropsUsed.typography;
  const typoUsed = Object.entries(typoOptional).filter(([_, v]) => v > 0);
  if (typoUsed.length > 0) {
    console.log('  Typography:');
    typoUsed.forEach(([prop, count]) => {
      console.log(`    • ${prop}: ${count} token(s)`);
    });
  }

  // Transition optional props
  const transOptional = optionalPropsUsed.transition;
  if (transOptional.delay > 0) {
    console.log('  Transition:');
    console.log(`    • delay: ${transOptional.delay} token(s)`);
  }

  // Token-level optional props
  const tokenOptional = optionalPropsUsed.token;
  const tokenUsed = Object.entries(tokenOptional).filter(([_, v]) => v > 0);
  if (tokenUsed.length > 0) {
    console.log('  Token Metadata:');
    tokenUsed.forEach(([prop, count]) => {
      console.log(`    • ${prop}: ${count} token(s)`);
    });
  }

  // Group-level optional props
  const groupOptional = optionalPropsUsed.group;
  const groupUsed = Object.entries(groupOptional).filter(([_, v]) => v > 0);
  if (groupUsed.length > 0) {
    console.log('  Group Metadata:');
    groupUsed.forEach(([prop, count]) => {
      console.log(`    • ${prop}: ${count} group(s)`);
    });
  }
}

/**
 * Validate all token files in a directory
 */
function validateTokenDirectory(
  dirPath,
  validator,
  schemaPath,
  strictMode = false
) {
  const results = [];

  if (!fs.existsSync(dirPath)) {
    console.error(`[validator] Directory not found: ${dirPath}`);
    return results;
  }

  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith('.json') || file.endsWith('.tokens.json'))
    .map((file) => path.join(dirPath, file));

  if (files.length === 0) {
    console.warn(`[validator] No JSON files found in ${dirPath}`);
    return results;
  }

  for (const filePath of files) {
    const result = validateTokenFile(
      filePath,
      validator,
      schemaPath,
      strictMode
    );
    results.push(result);
    logValidationResult(result, strictMode);
  }

  return results;
}

// CLI interface
const options = parseArgs();

if (!options.target) {
  console.error(
    '[validator] Usage: node w3c-validator.mjs [options] <file-or-directory>'
  );
  console.error('[validator] Options:');
  console.error(
    '  --strict, -s          Enable strict mode (enforce additionalProperties: false)'
  );
  console.error('  --permissive, -p      Use permissive schema');
  console.error('  --schema <name>        Specify schema file name');
  console.error('[validator] Examples:');
  console.error('  node w3c-validator.mjs tokens.json');
  console.error('  node w3c-validator.mjs --strict tokens.json');
  console.error('  node w3c-validator.mjs --permissive tokens.json');
  process.exit(1);
}

if (!fs.existsSync(options.target)) {
  console.error(`[validator] Target not found: ${options.target}`);
  process.exit(1);
}

// Create validator with options
const { validate, schema, strict } = createValidator({
  strict: options.strict,
  schema: options.schema,
});

const schemaPath = path.join(__dirname, options.schema);

const stats = fs.statSync(options.target);
let hasErrors = false;

if (stats.isDirectory()) {
  const results = validateTokenDirectory(
    options.target,
    { validate },
    schemaPath,
    strict
  );
  hasErrors = results.some((r) => !r.isValid);
} else {
  const result = validateTokenFile(
    options.target,
    { validate },
    schemaPath,
    strict
  );
  logValidationResult(result, strict);
  hasErrors = !result.isValid;
}

if (strict) {
  console.log(
    '\n[validator] Strict mode enabled - additionalProperties will be enforced'
  );
}

process.exit(hasErrors ? 1 : 0);
