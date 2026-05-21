# W3C Design Tokens Schema & Validator

A generic, reusable schema and validator for [W3C Design Tokens Community Group (DTCG) 1.0](https://tr.designtokens.org/format/) specification. This package can be used in any project without repository-specific dependencies.

## Schema Variants

This package includes **two schema variants**:

- **`w3c-schema-strict.json`** (default) - Strict DTCG 1.0 compliance, structured values only
- **`w3c-schema-permissive.json`** - Extended schema with custom types and string value support

See [SCHEMAS.md](./SCHEMAS.md) for detailed comparison and usage.

## Features

- ✅ **W3C DTCG 1.0 Compliant**: Full support for all standard token types
- ✅ **Dual Schema Support**: Choose strict (default) or permissive validation
- ✅ **Type-Safe**: TypeScript definitions included
- ✅ **Comprehensive Validation**: Schema validation + custom rules (circular references, type checking)
- ✅ **Accessibility Validation**: Optional WCAG 2.1 contrast ratio validation
- ✅ **Framework Agnostic**: Works with any JavaScript/TypeScript project
- ✅ **CLI Support**: Command-line interface for easy integration
- ✅ **Zero Dependencies** (except Ajv for validation)

## Installation

### Option 1: Copy Files Directly

Copy the following files to your project:

- `w3c-schema-strict.json` - Strict DTCG 1.0 JSON Schema (default)
- `w3c-schema-permissive.json` - Permissive schema with custom types (optional)
- `w3c-validator.ts` - TypeScript validator module
- `w3c-validator.mjs` - CLI validator script
- `w3c-types.ts` - TypeScript type definitions

### Option 2: Install Dependencies

If using the validator, install required dependencies:

```bash
npm install ajv ajv-formats
# or
yarn add ajv ajv-formats
# or
pnpm add ajv ajv-formats
```

## Usage

### TypeScript/JavaScript Module

```typescript
import { validateDesignTokens, setDefaultSchema } from './w3c-validator';
import schema from './w3c-schema-strict.json'; // or './w3c-schema-permissive.json'

// Set the schema (required before first use)
setDefaultSchema(schema);

const tokens = {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [1, 0, 0],
      },
    },
  },
  spacing: {
    small: {
      $type: 'dimension',
      $value: {
        value: 8,
        unit: 'px',
      },
    },
  },
};

const result = validateDesignTokens(tokens);

if (!result.isValid) {
  console.error('Validation errors:', result.errors);
  result.errors.forEach((error) => {
    console.error(`  ${error.path}: ${error.message}`);
  });
}

if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}
```

**Note:** You can also provide the schema directly in options:

```typescript
import { validateDesignTokens } from './w3c-validator';
import schema from './w3c-schema-strict.json';

const result = validateDesignTokens(tokens, {
  customSchema: schema,
});
```

### Command Line Interface

```bash
# Validate a single file
node w3c-validator.mjs tokens.json

# Validate all JSON files in a directory
node w3c-validator.mjs ./tokens/

# Make it executable and use directly
chmod +x w3c-validator.mjs
./w3c-validator.mjs tokens.json
```

### Validate from File

```typescript
import { validateDesignTokensFromFile } from './w3c-validator';

const result = await validateDesignTokensFromFile('./tokens.json');

if (result.isValid) {
  console.log('✅ Tokens are valid!');
} else {
  console.error('❌ Validation failed:', result.errors);
}
```

### Format Results

```typescript
import { validateDesignTokens, formatValidationResult } from './w3c-validator';

const result = validateDesignTokens(tokens);
console.log(formatValidationResult(result));
```

## Supported Token Types

The validator supports all DTCG 1.0 standard token types:

- `color` - Color values with color space support
- `dimension` - Size and spacing values (px, rem)
- `fontFamily` - Font family names or stacks
- `fontWeight` - Font weight (numeric or named)
- `duration` - Time durations in milliseconds
- `cubicBezier` - Easing functions
- `number` - Numeric values
- `border` - Border composite values
- `transition` - Transition composite values
- `shadow` - Box shadow values
- `gradient` - Gradient values
- `typography` - Typography composite values
- `strokeStyle` - Stroke/border style values

## Validation Features

### Schema Validation

Validates tokens against the W3C DTCG 1.0 JSON Schema, checking:

- Required properties (`$type`, `$value`)
- Value structure matches token type
- Valid color spaces and components
- Valid dimension units
- Proper token reference format

### Custom Validations

Beyond schema validation, the validator also checks:

- **Circular References**: Detects circular token dependencies
- **Self-References**: Prevents tokens from referencing themselves
- **Type Consistency**: Warns about potential type mismatches
- **Format Warnings**: Suggests improvements for color/dimension formats

## TypeScript Types

```typescript
import type {
  DesignTokens,
  Token,
  TokenType,
  ColorValue,
  DimensionValue,
  TokenReference,
} from './w3c-types';

const tokens: DesignTokens = {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [1, 0, 0],
      },
    },
  },
};
```

## Examples

### Basic Color Token

```json
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0.2, 0.4, 0.8]
      },
      "$description": "Primary brand color"
    }
  }
}
```

### Dimension Token with Reference

```json
{
  "spacing": {
    "base": {
      "$type": "dimension",
      "$value": {
        "value": 16,
        "unit": "px"
      }
    },
    "large": {
      "$type": "dimension",
      "$value": "{spacing.base}"
    }
  }
}
```

### Typography Composite Token

```json
{
  "typography": {
    "heading": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Inter, sans-serif",
        "fontSize": {
          "value": 24,
          "unit": "px"
        },
        "fontWeight": "bold",
        "lineHeight": 1.5
      }
    }
  }
}
```

### Shadow Token

```json
{
  "shadow": {
    "elevation": {
      "$type": "shadow",
      "$value": {
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 4,
          "unit": "px"
        },
        "blur": {
          "value": 8,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "color": {
          "colorSpace": "srgb",
          "components": [0, 0, 0],
          "alpha": 0.1
        }
      }
    }
  }
}
```

## Validation Options

```typescript
import { validateDesignTokens } from './w3c-validator';

const result = validateDesignTokens(tokens, {
  // Disable custom validations (only schema validation)
  customValidations: false,

  // Use a custom schema instead of default
  customSchema: myCustomSchema,

  // Allow additional properties (default: true)
  allowAdditionalProperties: true,
});
```

## Integration Examples

### CI/CD Pipeline

```yaml
# GitHub Actions example
- name: Validate Design Tokens
  run: |
    node utils/designTokens/w3c-validator.mjs ./tokens/
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

node utils/designTokens/w3c-validator.mjs ./tokens/
if [ $? -ne 0 ]; then
  echo "Design token validation failed!"
  exit 1
fi
```

### npm Scripts

```json
{
  "scripts": {
    "validate:tokens": "node utils/designTokens/w3c-validator.mjs ./tokens/",
    "validate:tokens:watch": "chokidar 'tokens/**/*.json' -c 'npm run validate:tokens'"
  }
}
```

## API Reference

### `validateDesignTokens(tokens, options?)`

Validates design tokens against the W3C schema.

**Parameters:**

- `tokens` (unknown): The design tokens object to validate
- `options` (ValidationOptions, optional): Validation options

**Returns:** `ValidationResult`

### `validateDesignTokensFromFile(filePath, options?)`

Validates design tokens from a JSON file.

**Parameters:**

- `filePath` (string): Path to the JSON file
- `options` (ValidationOptions, optional): Validation options

**Returns:** `Promise<ValidationResult>`

### `formatValidationResult(result)`

Formats validation results for console output.

**Parameters:**

- `result` (ValidationResult): Validation result to format

**Returns:** `string`

## Contributing

This is a generic, reusable package. To use it in your project:

1. Copy the files to your project
2. Install dependencies (`ajv`, `ajv-formats`)
3. Import and use as needed

## License

MIT

## Author

**Darian Rosebrook**  
GitHub: [@darianrosebrook](https://github.com/darianrosebrook)

This schema and validator are based on the W3C Design Tokens Community Group specification and can be used freely in any project.

## Contrast Validation (Optional)

The validator includes optional WCAG 2.1 contrast ratio validation for accessibility:

```typescript
import { validateDesignTokensWithContrast } from './w3c-validator-with-contrast';
import schema from './w3c-schema-strict.json';
import { setDefaultSchema } from './w3c-validator';

setDefaultSchema(schema);

const result = validateDesignTokensWithContrast(tokens, {
  contrastValidation: {
    level: 'AA_NORMAL', // WCAG AA for normal text
    colorPairs: [
      {
        foreground: '#000000',
        background: '#ffffff',
        context: 'Primary text on background',
        level: 'AA_NORMAL',
      },
    ],
  },
});

if (result.contrast) {
  console.log(
    `Contrast validation: ${result.contrast.validPairs}/${result.contrast.totalPairs} pairs passing`
  );
}
```

### WCAG Levels

- `AA_NORMAL`: 4.5:1 (normal text, 14pt and smaller)
- `AA_LARGE`: 3.0:1 (large text, 18pt+ or 14pt+ bold)
- `AAA_NORMAL`: 7.0:1 (enhanced accessibility, normal text)
- `AAA_LARGE`: 4.5:1 (enhanced accessibility, large text)

## References

- [W3C Design Tokens Format Module](https://tr.designtokens.org/format/)
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
- [JSON Schema Specification](https://json-schema.org/)
- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
