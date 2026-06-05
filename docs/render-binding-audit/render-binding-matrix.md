# Render prop->DOM binding obligation matrix

`RENDER-PROP-BINDING-BLAST-RADIUS-01` — read-only. Each declared prop's render obligation is derived from the contract's own declared structure (anatomy.dom bindings/events/content, channels, variants, propType, form) plus a host-capability map; per-framework status is verified against the generated artifacts. No fixes are made here.

Components: **47** · Frameworks: react, vue, svelte, angular, lit · Total declared prop rows: **305**

## Obligation bucket distribution

| bucket | count |
|---|---|
| no-render | 95 |
| behavior | 75 |
| class-state | 60 |
| native-attr | 35 |
| aria-attr | 27 |
| content | 11 |
| css-var | 2 |

## Failing class A — native-attr declared but NOT bound (confirmed absent in all 5 frameworks)

_none_

## Failing class B — aria-attr expected but absent in all 5 frameworks

_none_

## Full matrix (per component)

### Accordion  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `collapsible` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `defaultValue` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `disabled` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `onValueChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `type` | styled | ? | class-state | consumed | class | - | - | - | - | - |
| `value` | styled | ? | behavior | consumed | - | - | - | - | - | - |

### Alert  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `dismissLabel` | designed | string | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `dismissible` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `icon` | designed | node | content | bound | content | - | - | - | - | - |
| `intent` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `level` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `onDismiss` | designed | callback | behavior | consumed | - | - | - | - | - | - |

### AlertNotice  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `dismissLabel` | designed | string | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `dismissible` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `icon` | designed | node | content | bound | content | - | - | - | - | - |
| `level` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `onDismiss` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `status` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Avatar  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `name` | designed | string | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `priority` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `src` | designed | string | native-attr | bound | div[src] | bound | bound | bound | bound | bound |

### Badge  <span>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `icon` | designed | node | content | consumed | content | - | - | - | - | - |
| `intent` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `showStatusIcon` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `variant` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Blockquote  <blockquote>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `cite` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `variant` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Breadcrumbs  <nav>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `ariaLabel` | styled | ? | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `separator` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |

### Button  <button>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `ariaExpanded` | designed | boolean | aria-attr | derived | aria-expanded | bound | bound | bound | bound | bound |
| `ariaLabel` | designed | string | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `ariaPressed` | designed | boolean | aria-attr | derived | aria-pressed | bound | bound | bound | bound | bound |
| `disabled` | designed | boolean | native-attr | bound | button[disabled] | bound | bound | bound | bound | bound |
| `loading` | designed | boolean | aria-attr | derived | aria-busy | bound | bound | bound | bound | bound |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `title` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `type` | designed | ref | native-attr | bound | button[type] | bound | bound | bound | bound | bound |
| `variant` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Calendar  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `daysShown` | designed | number | no-render | not-applicable | - | - | - | - | - | - |
| `defaultValue` | designed | union | behavior | consumed | - | - | - | - | - | - |
| `disabled` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `locale` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `maxDate` | designed | ref | no-render | not-applicable | - | - | - | - | - | - |
| `minDate` | designed | ref | no-render | not-applicable | - | - | - | - | - | - |
| `mode` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `onChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `shouldCloseOnSelect` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `value` | designed | union | behavior | consumed | - | - | - | - | - | - |

### Card  <?>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `density` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `interactive` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `status` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Checkbox  <input>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `checked` | designed | boolean | behavior | consumed | - | - | - | - | - | - |
| `defaultChecked` | designed | boolean | behavior | consumed | - | - | - | - | - | - |
| `disabled` | designed | boolean | native-attr | bound | input[disabled] | bound | bound | bound | bound | bound |
| `indeterminate` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `name` | designed | string | native-attr | bound | input[name] | bound | bound | bound | bound | bound |
| `onChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `value` | designed | string | native-attr | bound | input[value] | bound | bound | bound | bound | bound |

### Chip  <button>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `ariaExpanded` | designed | boolean | aria-attr | derived | aria-expanded | bound | bound | bound | bound | bound |
| `ariaLabel` | designed | string | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `ariaPressed` | designed | boolean | aria-attr | derived | aria-pressed | bound | bound | bound | bound | bound |
| `disabled` | designed | boolean | native-attr | bound | button[disabled] | bound | bound | bound | bound | bound |
| `icon` | designed | node | content | consumed | content | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `title` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `type` | designed | ref | native-attr | bound | button[type] | bound | bound | bound | bound | bound |
| `variant` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Command  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `defaultOpen` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `defaultSearch` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `emptyMessage` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `filter` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `label` | styled | ? | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `onOpenChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `onSearchChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `open` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `placeholder` | styled | ? | native-attr | bound | div[placeholder] | bound | bound | bound | bound | bound |
| `search` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `shouldFilter` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |

### Details  <details>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `defaultOpen` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `disabled` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `icon` | styled | ? | class-state | consumed | class | - | - | - | - | - |
| `onOpenChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `open` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `summary` | styled | ? | content | bound | content | - | - | - | - | - |
| `variant` | styled | ? | class-state | consumed | class | - | - | - | - | - |

### Dialog  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `closeOnBackdropClick` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `closeOnEscape` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `defaultOpen` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `dismissible` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `initialFocus` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `modal` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `onOpenChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `open` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `returnFocus` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `size` | styled | ? | class-state | consumed | class | - | - | - | - | - |

### Divider  <hr>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `decorative` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `orientation` | designed | enum | class-state | consumed | class | - | - | - | - | - |
| `thickness` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `title` | designed | string | no-render | not-applicable | - | - | - | - | - | - |

### Field  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `defaultValue` | designed | ? | behavior | consumed | - | - | - | - | - | - |
| `disabled` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `error` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `helpText` | designed | node | content | consumed | content | - | - | - | - | - |
| `id` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `label` | designed | node | content | consumed | content | - | - | - | - | - |
| `name` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `onChange` | designed | ? | behavior | consumed | - | - | - | - | - | - |
| `readOnly` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `required` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `status` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `validate` | designed | ? | no-render | not-applicable | - | - | - | - | - | - |
| `validating` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `value` | designed | ? | behavior | consumed | - | - | - | - | - | - |

### Icon  <span>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `height` | designed | number | no-render | not-applicable | - | - | - | - | - | - |
| `icon` | designed | ref | no-render | not-applicable | - | - | - | - | - | - |
| `width` | designed | number | no-render | not-applicable | - | - | - | - | - | - |

### Image  <img>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `alt` | designed | string | native-attr | bound | img[alt] | bound | bound | bound | bound | bound |
| `aspectRatio` | designed | ref | no-render | not-applicable | - | - | - | - | - | - |
| `fallbackSrc` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `height` | designed | number | native-attr | bound | img[height] | bound | bound | bound | bound | bound |
| `loading` | designed | ref | native-attr | bound | img[loading] | bound | bound | bound | bound | bound |
| `objectFit` | designed | ref | no-render | not-applicable | - | - | - | - | - | - |
| `objectPosition` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `radius` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `showPlaceholder` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `sizes` | designed | string | native-attr | bound | img[sizes] | bound | bound | bound | bound | bound |
| `src` | designed | string | native-attr | bound | img[src] | bound | bound | bound | bound | bound |
| `width` | designed | number | native-attr | bound | img[width] | bound | bound | bound | bound | bound |

### Input  <input>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `defaultValue` | designed | string | behavior | consumed | - | - | - | - | - | - |
| `disabled` | designed | boolean | native-attr | bound | input[disabled] | bound | bound | bound | bound | bound |
| `invalid` | designed | boolean | aria-attr | derived | aria-invalid | bound | bound | bound | bound | bound |
| `name` | designed | string | native-attr | bound | input[name] | bound | bound | bound | bound | bound |
| `onChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `placeholder` | designed | string | native-attr | bound | input[placeholder] | bound | bound | bound | bound | bound |
| `required` | designed | boolean | native-attr | bound | input[required] | bound | bound | bound | bound | bound |
| `type` | designed | string | native-attr | bound | input[type] | bound | bound | bound | bound | bound |
| `value` | designed | string | behavior | consumed | - | - | - | - | - | - |

### Label  <label>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `form` | designed | string | native-attr | bound | label[form] | bound | bound | bound | bound | bound |
| `htmlFor` | designed | string | native-attr | bound | label[htmlFor] | bound | absent | absent | bound | bound |

### Links  <a>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `disabled` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `href` | designed | string | native-attr | bound | a[href] | bound | bound | bound | bound | bound |
| `rel` | designed | string | native-attr | bound | a[rel] | bound | bound | bound | bound | bound |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `target` | designed | ref | native-attr | bound | a[target] | bound | bound | bound | bound | bound |

### List  <ul>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `as` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `marker` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `spacing` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `variant` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### NavList  <nav>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `ariaLabel` | styled | ? | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `orientation` | styled | ? | class-state | consumed | class | - | - | - | - | - |

### OTP  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `defaultValue` | designed | string | behavior | consumed | - | - | - | - | - | - |
| `disabled` | designed | boolean | native-attr | bound | div[disabled] | bound | bound | bound | bound | bound |
| `label` | designed | string | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `length` | designed | number | no-render | not-applicable | - | - | - | - | - | - |
| `mode` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `onChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `onComplete` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `readOnly` | designed | boolean | aria-attr | derived | aria-readonly | bound | bound | bound | bound | bound |
| `value` | designed | string | behavior | consumed | - | - | - | - | - | - |

### Popover  <?>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `closeOnBlur` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `closeOnEscape` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `closeOnOutsideClick` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `defaultOpen` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `disabled` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `onOpenChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `open` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `placement` | styled | ? | class-state | consumed | class | - | - | - | - | - |

### Postcard  <article>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `author` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `embed` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `postId` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `stats` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `timestamp` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |

### ProfileFlag  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `profile` | designed | ref | no-render | not-applicable | - | - | - | - | - | - |

### Progress  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `formatValue` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `intent` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `label` | designed | string | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `showValue` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `value` | designed | number | aria-attr | derived | aria-valuenow | bound | bound | bound | bound | bound |
| `variant` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Select  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `defaultOpen` | designed | boolean | behavior | consumed | - | - | - | - | - | - |
| `defaultValue` | designed | union | behavior | consumed | - | - | - | - | - | - |
| `disabled` | designed | boolean | aria-attr | derived | aria-disabled | bound | bound | bound | bound | bound |
| `empty` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `filterFn` | designed | ? | no-render | not-applicable | - | - | - | - | - | - |
| `multiple` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `onChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `onOpenChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `open` | designed | boolean | behavior | consumed | - | - | - | - | - | - |
| `options` | designed | array | no-render | not-applicable | - | - | - | - | - | - |
| `searchable` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `value` | designed | union | behavior | consumed | - | - | - | - | - | - |

### Sheet  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `defaultOpen` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `modal` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `onOpenChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `open` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `side` | styled | ? | native-attr | bound | div[data-side] | bound | absent | bound | absent | bound |

### ShowMore  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `defaultExpanded` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `expanded` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `maxLines` | styled | ? | css-var | bound | style --var | - | - | - | - | - |
| `onExpandedChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `showLessLabel` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `showMoreLabel` | styled | ? | content | bound | content | - | - | - | - | - |

### Shuttle  <ul>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `ariaLabel` | designed | string | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `defaultValue` | designed | array | behavior | consumed | - | - | - | - | - | - |
| `onValueChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `value` | designed | array | behavior | consumed | - | - | - | - | - | - |

### Skeleton  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `animate` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `ariaLabel` | designed | string | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `aspectRatio` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `decorative` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `density` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `lines` | designed | ref | no-render | not-applicable | - | - | - | - | - | - |
| `radius` | designed | ref | no-render | not-applicable | - | - | - | - | - | - |
| `variant` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Spinner  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `ariaHidden` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `inline` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `label` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `showAfterMs` | designed | number | no-render | not-applicable | - | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `thickness` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `variant` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Stat  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `trend` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Status  <span>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `status` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Switch  <label>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `checked` | designed | boolean | behavior | consumed | - | - | - | - | - | - |
| `defaultChecked` | designed | boolean | behavior | consumed | - | - | - | - | - | - |
| `disabled` | designed | boolean | native-attr | bound | label[disabled] | bound | bound | bound | bound | bound |
| `name` | designed | string | native-attr | bound | label[name] | bound | bound | bound | bound | bound |
| `onChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `value` | designed | string | native-attr | bound | label[value] | bound | bound | bound | bound | bound |

### Table  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `ariaLabel` | styled | ? | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `responsive` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |

### Tabs  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `activationMode` | styled | ? | class-state | consumed | class | - | - | - | - | - |
| `appearance` | styled | ? | class-state | consumed | class | - | - | - | - | - |
| `defaultValue` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `idBase` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `loop` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `onValueChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `orientation` | styled | ? | class-state | consumed | class | - | - | - | - | - |
| `unmountInactive` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `value` | styled | ? | behavior | consumed | - | - | - | - | - | - |

### Text  <p>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `align` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `as` | designed | ref | no-render | not-applicable | - | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `transform` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `truncate` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `variant` | designed | ref | class-state | consumed | class | - | - | - | - | - |
| `weight` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### TextField  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `ariaDescribedby` | designed | string | aria-attr | derived | aria-describedby | bound | bound | bound | bound | bound |
| `defaultValue` | designed | string | behavior | consumed | - | - | - | - | - | - |
| `description` | designed | node | content | consumed | content | - | - | - | - | - |
| `disabled` | designed | boolean | native-attr | bound | div[disabled] | bound | bound | bound | bound | bound |
| `error` | designed | node | content | consumed | content | - | - | - | - | - |
| `invalid` | designed | boolean | aria-attr | derived | aria-invalid | bound | bound | bound | bound | bound |
| `label` | designed | node | content | consumed | content | - | - | - | - | - |
| `name` | designed | string | native-attr | bound | div[name] | bound | bound | bound | bound | bound |
| `onChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `required` | designed | boolean | native-attr | bound | div[required] | bound | bound | bound | bound | bound |
| `type` | designed | string | native-attr | bound | div[type] | bound | bound | bound | bound | bound |
| `value` | designed | string | behavior | consumed | - | - | - | - | - | - |

### Toast  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `action` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `onOpenChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `open` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `politeness` | styled | ? | class-state | consumed | class | - | - | - | - | - |
| `title` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `variant` | styled | ? | class-state | consumed | class | - | - | - | - | - |

### ToggleSwitch  <button>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `ariaDescribedby` | designed | string | aria-attr | derived | aria-describedby | bound | bound | bound | bound | bound |
| `ariaLabel` | designed | string | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `checked` | designed | boolean | behavior | consumed | - | - | - | - | - | - |
| `defaultChecked` | designed | boolean | behavior | consumed | - | - | - | - | - | - |
| `disabled` | designed | boolean | native-attr | bound | button[disabled] | bound | bound | bound | bound | bound |
| `onChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |
| `size` | designed | ref | class-state | consumed | class | - | - | - | - | - |

### Tooltip  <?>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `closeOnBlur` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `closeOnEscape` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `defaultOpen` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `disabled` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `onOpenChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `open` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `placement` | styled | ? | class-state | consumed | class | - | - | - | - | - |

### Truncate  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `collapseText` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `defaultExpanded` | designed | boolean | behavior | consumed | - | - | - | - | - | - |
| `expandText` | designed | string | no-render | not-applicable | - | - | - | - | - | - |
| `expandable` | designed | boolean | no-render | not-applicable | - | - | - | - | - | - |
| `expanded` | designed | boolean | behavior | consumed | - | - | - | - | - | - |
| `lines` | designed | number | css-var | bound | style --var | - | - | - | - | - |
| `onExpandedChange` | designed | callback | behavior | consumed | - | - | - | - | - | - |

### Walkthrough  <div>

| prop | propBucket | type | obligation bucket | status | target | react | vue | svelte | angular | lit |
|---|---|---|---|---|---|---|---|---|---|---|
| `autoStart` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `closeOnOutsideClick` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `defaultIndex` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `index` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `label` | styled | ? | aria-attr | derived | aria-label | bound | bound | bound | bound | bound |
| `onComplete` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `onSkip` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `onStepChange` | styled | ? | behavior | consumed | - | - | - | - | - | - |
| `placement` | styled | ? | class-state | consumed | class | - | - | - | - | - |
| `steps` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |
| `storageKey` | styled | ? | no-render | not-applicable | - | - | - | - | - | - |

