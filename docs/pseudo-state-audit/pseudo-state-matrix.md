# Pseudo/state styling realization matrix

`PSEUDO-STATE-STYLING-RAIL-01` — read-only. Each declared state obligation (from `states.dimensions`, plus the empty-field input prompt for text inputs) is classified against the generated React CSS using the codegen's realization vocabulary: a derivable pseudo-class (`:hover`/`:focus-visible`/`:disabled`/`:checked`), an ARIA-attribute selector (`[aria-expanded="true"]`), the `:has(.<prefix>__input:<state>)` input wrapper, or a BEM modifier (`.<prefix>--<value>`). An obligation is **realized** if any valid form exists, **base** if it is the dimension's initial value, **behavioral** if it is channel-driven / suppressed / focus-exempt (not a CSS gap), or a **gap** otherwise.

Components with states: **49** · obligations: **231** · realized: **62** · gaps: **19**

## Gaps — declared state obligations with no realization

| component | dim | category | value | expected selector |
|---|---|---|---|---|
| Breadcrumbs | `pointer` | interaction | `hover` | `.breadcrumbs:hover` |
| Calendar | `availability` | availability | `disabled` | `.calendar:disabled` |
| Calendar | `today` | presentation | `today` | `.calendar--today` |
| Calendar | `month` | presentation | `outsideMonth` | `.calendar--outsideMonth` |
| Chip | `availability` | availability | `disabled` | `.chip:disabled` |
| Command | `availability` | availability | `disabled` | `:has(.command__input:disabled)` |
| Details | `availability` | availability | `disabled` | `.details:disabled` |
| Dialog | `pointer` | interaction | `active` | `.dialog:active` |
| Dialog | `focus` | interaction | `focus` | `.dialog:focus-visible` |
| Image | `validation` | validation | `error` | `.image--error` |
| Image | `loading` | data | `loading` | `.image--loading` |
| Input | `prompt` | prompt | `empty-prompt` | `.input:placeholder-shown (or .input__input:placeholder-shown)` |
| NavList | `focus` | interaction | `focus` | `.nav-list:focus-visible` |
| Tabs | `focus` | interaction | `focus` | `.tabs:focus-visible` |
| Tabs | `selection` | selection | `selected` | `.tabs[aria-selected="true"]` |
| Text | `validation` | validation | `error` | `.text--error` |
| Text | `validation` | validation | `success` | `.text--success` |
| TextField | `prompt` | prompt | `empty-prompt` | `.text-field:placeholder-shown (or .text-field__input:placeholder-shown)` |
| Walkthrough | `availability` | availability | `disabled` | `.walkthrough:disabled` |

## Full matrix (per component)

### Accordion  `.accordion`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✓ |
| `disclosure` | visibility | closed | closed∘ open✓ |

### Alert  `.alert`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |

### AlertNotice  `.alert-notice`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Avatar  `.avatar`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |
| `focus` | interaction | unfocused | unfocused∘ focus~ |

### Badge  `.badge`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |

### Blockquote  `.blockquote`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Breadcrumbs  `.breadcrumbs`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✗ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |

### Button  `.button`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ active✓ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✓ |

### Calendar  `.calendar`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✗ |
| `selection` | selection | unselected | unselected∘ selected✓ |
| `today` | presentation | other | other∘ today✗ |
| `month` | presentation | inMonth | inMonth∘ outsideMonth✗ |

### Card  `.card`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ active✓ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `affordance` | interaction | static | static∘ interactive✓ |

### Checkbox  `.checkbox` · input-backed

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✓ |
| `selection` | selection | unchecked | unchecked∘ checked✓ |

### Chip  `.chip`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ active~ |
| `focus` | interaction | unfocused | unfocused∘ focus~ |
| `availability` | availability | enabled | enabled∘ disabled✗ |

### CodeBlock  `.code-block`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### CodeSnippet  `.code-snippet`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Command  `.command` · input-backed

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |
| `availability` | availability | enabled | enabled∘ disabled✗ |
| `selection` | selection | unselected | unselected∘ selected✓ |

### Details  `.details`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✗ |
| `disclosure` | visibility | closed | closed∘ open✓ |

### Dialog  `.dialog`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ active✗ |
| `focus` | interaction | unfocused | unfocused∘ focus✗ |
| `openness` | visibility | closed | closed∘ opening~ open~ closing~ |

### Divider  `.divider`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Field  `.field` · focus:none

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |
| `focus` | interaction | unfocused | unfocused∘ focus~ |
| `availability` | availability | enabled | enabled∘ disabled✓ |

### Icon  `.icon` · focus:none

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Image  `.image`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |
| `validation` | validation | valid | valid∘ error✗ |
| `loading` | data | idle | idle∘ loading✗ |

### Input  `.input` · focus:none

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✓ |
| `validation` | validation | valid | valid∘ invalid✓ |
| `prompt` | prompt | — | empty-prompt✗ |

### Label  `.label`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Links  `.links`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ visited✓ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✓ |

### List  `.list` · focus:none

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### NavList  `.nav-list`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |
| `focus` | interaction | unfocused | unfocused∘ focus✗ |

### OTP  `.otp`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✓ |

### Popover  `.popover` · focus:none

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |
| `focus` | interaction | unfocused | unfocused∘ focus~ |
| `disclosure` | visibility | closed | closed∘ open~ |
| `transition` | motion | idle | idle∘ entering~ leaving~ |

### Postcard  `.postcard` · focus:none

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |

### ProfileFlag  `.profile-flag`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |

### Progress  `.progress`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Select  `.select`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ active~ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✓ |
| `selection` | selection | unselected | unselected∘ selected✓ |
| `disclosure` | visibility | closed | closed∘ open✓ |

### Sheet  `.sheet`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover~ |
| `focus` | interaction | unfocused | unfocused∘ focus~ |
| `openness` | visibility | closed | closed∘ opening~ open~ closing~ |

### ShowMore  `.show-more`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |
| `expansion` | visibility | collapsed | collapsed∘ expanded✓ |

### Shuttle  `.shuttle`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Skeleton  `.skeleton`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Spinner  `.spinner`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Stat  `.stat`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Status  `.status`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |

### Switch  `.switch` · input-backed

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover~ |
| `focus` | interaction | unfocused | unfocused∘ focus~ |
| `availability` | availability | enabled | enabled∘ disabled✓ |
| `selection` | selection | unchecked | unchecked∘ checked✓ |

### Table  `.table` · focus:none

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |
| `focus` | interaction | unfocused | unfocused∘ focus~ |
| `selection` | selection | unselected | unselected∘ selected✓ |

### Tabs  `.tabs`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ |
| `focus` | interaction | unfocused | unfocused∘ focus✗ |
| `selection` | selection | unselected | unselected∘ selected✗ |

### Text  `.text`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |
| `validation` | validation | valid | valid∘ error✗ success✗ |

### TextField  `.text-field`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✓ |
| `validation` | validation | valid | valid∘ invalid✓ |
| `prompt` | prompt | — | empty-prompt✗ |

### Toast  `.toast` · focus:none

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover~ |
| `focus` | interaction | unfocused | unfocused∘ focus~ |
| `visibility` | visibility | hidden | hidden∘ visible~ |
| `transition` | motion | idle | idle∘ entering~ leaving~ |

### ToggleSwitch  `.toggle-switch` · input-backed

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover✓ active~ |
| `focus` | interaction | unfocused | unfocused∘ focus✓ |
| `availability` | availability | enabled | enabled∘ disabled✓ |
| `selection` | selection | unchecked | unchecked∘ checked✓ |

### Tooltip  `.tooltip` · focus:none

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover~ |
| `transition` | motion | idle | idle∘ entering~ leaving~ |

### Truncate  `.truncate`

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover~ |
| `focus` | interaction | unfocused | unfocused∘ focus~ |
| `expansion` | visibility | collapsed | collapsed∘ expanded✓ |

### Walkthrough  `.walkthrough` · focus:none

| dim | category | initial | values (✓ realized · ✗ gap · ∘ base · ~ behavioral) |
|---|---|---|---|
| `pointer` | interaction | default | default∘ hover~ |
| `availability` | availability | enabled | enabled∘ disabled✗ |

