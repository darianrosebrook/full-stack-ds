# Design Tokens Resolver Module

This module is DTCG-inspired and currently tested for local resolver behavior: set resolution,
modifier cascades, JSON Pointer references, alias resolution, modifier precedence, and
strict/non-strict invalid input handling. It does not yet claim full DTCG Resolver Module
conformance. Conformance tests are in `test/utils/designTokens/resolver/`.

## Overview

The Resolver Module provides a way to manage design tokens across multiple contexts (themes,
platforms, brands, etc.) while avoiding combinatorial explosion. The implementation is modeled
on the DTCG Resolver Module concept; see the [specification](https://www.designtokens.org/tr/2025.10/resolver/)
for the authoritative definition. Where this implementation diverges or falls short of the
spec, the tests in `test/utils/designTokens/resolver/resolver-module.test.ts` document what
is actually proven.

## Files

- `resolver-module.ts` - Core Resolver class implementing the specification
- `resolver-integration.ts` - Integration layer for backward compatibility
- `resolver.schema.json` - JSON schema for validating resolver documents
- `resolver.example.json` - Example resolver document structure

## Key Features

### 1. Sets

Collections of design tokens that can be referenced and reused:

```json
{
  "sets": {
    "foundation": {
      "sources": [
        { "$ref": "core/color.tokens.json" },
        { "$ref": "core/typography.tokens.json" }
      ]
    }
  }
}
```

### 2. Modifiers

Define contexts for different values (themes, platforms, etc.):

```json
{
  "modifiers": {
    "theme": {
      "contexts": {
        "light": {
          "sources": [{ "$ref": "#/sets/foundation" }]
        },
        "dark": {
          "sources": [
            { "$ref": "#/sets/foundation" },
            { "$ref": "theme/dark.tokens.json" }
          ]
        }
      }
    }
  }
}
```

### 3. Resolution Order

Defines the order in which sets and modifiers are applied:

```json
{
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/modifiers/theme" }
  ]
}
```

## Usage

### Basic Usage

```typescript
import { Resolver, loadResolverDocument } from './resolver-module';

// Load resolver document
const doc = loadResolverDocument('./resolver.json');

// Create resolver instance
const resolver = new Resolver(doc, {
  basePath: './tokens',
  onWarn: (d) => console.warn(d.message),
  onError: (d) => console.error(d.message),
});

// Resolve tokens for specific input
const result = resolver.resolve({
  theme: 'dark',
  brand: 'brandA',
});

// Access resolved tokens
console.log(result.tokens);
```

### Integration with Existing Code

The integration layer provides backward compatibility:

```typescript
import { resolveWithResolverModule } from './resolver-integration';

// Try to use resolver module, fall back to legacy if not available
const tokens = resolveWithResolverModule(
  legacyTokens,
  config,
  './resolver.json'
);
```

## Migration Path

### Step 1: Create Resolver Document

Create a `resolver.json` file following the example structure:

```json
{
  "version": "2025-10-01",
  "sets": {
    "foundation": {
      "sources": [{ "$ref": "core/color.tokens.json" }]
    }
  },
  "modifiers": {
    "theme": {
      "contexts": {
        "light": { "sources": [{ "$ref": "#/sets/foundation" }] },
        "dark": { "sources": [{ "$ref": "#/sets/foundation" }] }
      }
    }
  },
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/modifiers/theme" }
  ]
}
```

### Step 2: Update Generators

Update token generators to use the resolver module:

```typescript
import { createResolver } from './resolver-integration';

const resolver = createResolver('./resolver.json', config);
if (resolver) {
  const result = resolver.resolve({ theme: 'dark' });
  // Use result.tokens
}
```

### Step 3: Gradual Migration

You can migrate gradually:

- Keep existing token files working
- Create resolver documents for new contexts
- Update generators to prefer resolver module when available
- Migrate existing contexts over time

## Reference Syntax

The resolver module supports JSON Pointer syntax for references:

- `#/sets/foundation` - Reference to a set in the same document
- `#/modifiers/theme` - Reference to a modifier in the same document
- `core/color.tokens.json` - Reference to an external file
- `#/$defs/colors` - Reference to bundled definitions

## What is proven

The following behaviors are covered by passing tests in `test/utils/designTokens/resolver/resolver-module.test.ts`:

- Set resolution: inline token sources are merged into a flat token tree
- Modifier cascades: later modifiers in resolutionOrder override earlier values
- Alias resolution: `{a.b}` syntax resolves to the target token value
- Modifier precedence: the last matching context wins
- Strict/non-strict invalid input: strict throws, non-strict warns and falls back to default
- Circular alias detection: detected and warned; does not loop
- Missing file: emits a diagnostic and continues with available tokens
- Cross-file references: external token files are loaded and merged correctly

Full DTCG Resolver Module conformance is not claimed. Edge cases in the spec (bundling, `$defs`
resolution, multi-context modifiers) are not yet covered by tests.

## See Also

- [Resolver Module Specification](https://www.designtokens.org/tr/2025.10/resolver/)
- [Format Module Specification](https://www.designtokens.org/tr/2025.10/format/)
- [Design Tokens Schema](./designTokens.schema.json)
