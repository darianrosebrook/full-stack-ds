#!/usr/bin/env node

/**
 * Design Tokens Validation Utilities
 *
 * Provides validation functions for design token files using the generated JSON schema
 * and additional custom validation rules.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

const SCHEMA_PATH = path.join(
  PROJECT_ROOT,
  'utils',
  'designTokens',
  'validators',
  'designTokens.schema.json'
);

let ajvInstance = null;
let schemaValidator = null;

/**
 * Initialize the AJV validator with the schema
 */
function initializeValidator() {
  if (ajvInstance) return ajvInstance;

  ajvInstance = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false, // Allow additional properties for flexibility
  });

  addFormats(ajvInstance);

  // Load the schema
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.warn(
      '[validation] Schema file not found. Run schema generation first.'
    );
    return null;
  }

  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  schemaValidator = ajvInstance.compile(schema);

  return ajvInstance;
}

/**
 * Validate a token file against the schema
 */
export function validateTokenFile(filePath) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    tokens: null,
    filePath,
  };

  try {
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const tokens = JSON.parse(fileContent);
    result.tokens = tokens;

    // Initialize validator if needed
    if (!initializeValidator()) {
      result.warnings.push('Schema validation skipped - schema not available');
      return result;
    }

    // Validate against schema
    const isSchemaValid = schemaValidator(tokens);

    if (!isSchemaValid) {
      result.isValid = false;
      result.errors.push(
        ...(schemaValidator.errors || []).map((error) => ({
          type: 'schema',
          path: error.instancePath || 'root',
          message: error.message,
          data: error.data,
          schema: error.schema,
        }))
      );
    }

    // Additional custom validations
    const customValidation = performCustomValidations(tokens, filePath);
    result.errors.push(...customValidation.errors);
    result.warnings.push(...customValidation.warnings);

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
function performCustomValidations(tokens, filePath) {
  const errors = [];
  const warnings = [];

  // Track token references for circular dependency detection
  const tokenRefs = new Map();
  const visited = new Set();

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

  function validateGroup(group, path) {
    // Groups should have meaningful names
    if (path.length === 0) {
      warnings.push({
        type: 'naming',
        path,
        message: 'Root level groups should have descriptive names',
      });
    }
  }

  function validateTokenType(token, path) {
    const { $type, $value } = token;

    switch ($type) {
      case 'color':
        if (
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
        if (
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
        if (
          typeof $value !== 'number' &&
          !$value.toString().match(/^(\d+(\.\d+)?|\{)/)
        ) {
          warnings.push({
            type: 'number-format',
            path,
            message: 'Number value should be numeric or a token reference',
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

  return { errors, warnings };
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
export function logValidationResult(result) {
  const { isValid, errors, warnings, filePath } = result;
  const fileName = path.basename(filePath);

  if (isValid && warnings.length === 0) {
    console.log(`[validation] ✅ ${fileName} - Valid`);
    return;
  }

  if (warnings.length > 0) {
    console.log(`[validation] ⚠️  ${fileName} - ${warnings.length} warning(s)`);
    warnings.forEach((warning) => {
      console.log(`  Warning: ${warning.path} - ${warning.message}`);
    });
  }

  if (!isValid) {
    console.log(`[validation] ❌ ${fileName} - ${errors.length} error(s)`);
    errors.forEach((error) => {
      console.log(`  Error: ${error.path} - ${error.message}`);
    });
  }
}

/**
 * Validate all token files in a directory
 */
export function validateTokenDirectory(dirPath) {
  const results = [];

  if (!fs.existsSync(dirPath)) {
    console.error(`[validation] Directory not found: ${dirPath}`);
    return results;
  }

  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith('.tokens.json'))
    .map((file) => path.join(dirPath, file));

  for (const filePath of files) {
    const result = validateTokenFile(filePath);
    results.push(result);
    logValidationResult(result);
  }

  return results;
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const defaultPath = path.join(PROJECT_ROOT, 'ui', 'designTokens');
  const targetPath = process.argv[2] || defaultPath;

  // Check if target exists
  if (!fs.existsSync(targetPath)) {
    console.error(`[validation] Target not found: ${targetPath}`);
    console.error(`[validation] Try running: npm run tokens:compose first`);
    process.exit(1);
  }

  if (fs.statSync(targetPath).isDirectory()) {
    const results = validateTokenDirectory(targetPath);
    const hasErrors = results.some((r) => !r.isValid);
    process.exit(hasErrors ? 1 : 0);
  } else {
    const result = validateTokenFile(targetPath);
    logValidationResult(result);
    process.exit(result.isValid ? 0 : 1);
  }
}
