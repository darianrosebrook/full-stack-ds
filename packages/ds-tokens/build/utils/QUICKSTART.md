# Quick Start Guide

Get started with the W3C Design Tokens Validator in 5 minutes.

## Installation

1. **Copy the files** to your project:

   ```
   utils/designTokens/
   ├── w3c-schema.json      # JSON Schema
   ├── w3c-validator.ts     # TypeScript validator
   ├── w3c-validator.mjs    # CLI script
   ├── w3c-types.ts         # TypeScript types
   └── w3c-index.ts         # Main entry point
   ```

2. **Install dependencies**:
   ```bash
   npm install ajv ajv-formats
   ```

## Basic Usage

### 1. Validate Tokens Programmatically

```typescript
import { validateDesignTokens, setDefaultSchema } from './w3c-validator';
import schema from './w3c-schema.json';

// Set the schema
setDefaultSchema(schema);

// Your tokens
const tokens = {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [0.2, 0.4, 0.8],
      },
    },
  },
};

// Validate
const result = validateDesignTokens(tokens);

if (result.isValid) {
  console.log('✅ All tokens are valid!');
} else {
  console.error('❌ Validation failed:');
  result.errors.forEach((err) => {
    console.error(`  - ${err.path}: ${err.message}`);
  });
}
```

### 2. Use CLI Validator

```bash
# Validate a single file
node w3c-validator.mjs tokens.json

# Validate all JSON files in a directory
node w3c-validator.mjs ./tokens/
```

### 3. Use TypeScript Types

```typescript
import type { DesignTokens, ColorValue } from './w3c-types';

const tokens: DesignTokens = {
  color: {
    primary: {
      $type: 'color',
      $value: {
        colorSpace: 'srgb',
        components: [1, 0, 0],
      } as ColorValue,
    },
  },
};
```

## Example Token Files

### Minimal Valid Token

```json
{
  "color": {
    "primary": {
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0.2, 0.4, 0.8]
      }
    }
  }
}
```

### Token with Reference

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

## Integration Examples

### npm Script

Add to your `package.json`:

```json
{
  "scripts": {
    "validate:tokens": "node utils/designTokens/w3c-validator.mjs ./tokens/"
  }
}
```

### Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
node utils/designTokens/w3c-validator.mjs ./tokens/
exit $?
```

### CI/CD (GitHub Actions)

```yaml
- name: Validate Design Tokens
  run: |
    npm install ajv ajv-formats
    node utils/designTokens/w3c-validator.mjs ./tokens/
```

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check out the [W3C Design Tokens Specification](https://tr.designtokens.org/format/)
- Explore the TypeScript types in `w3c-types.ts`

## Troubleshooting

**Error: "No schema provided"**

- Make sure to call `setDefaultSchema(schema)` before validating
- Or provide `customSchema` in the options

**Error: "Cannot find module 'ajv'"**

- Install dependencies: `npm install ajv ajv-formats`

**CLI not working**

- Make sure the file is executable: `chmod +x w3c-validator.mjs`
- Or run with: `node w3c-validator.mjs tokens.json`
