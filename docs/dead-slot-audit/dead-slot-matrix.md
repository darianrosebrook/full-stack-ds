# Dead-slot matrix

`RAIL-STYLING-REALIZATION-LEDGERS-01` — gated by a two-directional ledger (`scripts/dead-slot-audit/known-dead.json`): the audit fails if a dead slot is unledgered OR if a ledger entry no longer reproduces. Each dead slot carries a machine-computed **disposition** (`scripts/dead-slot-audit/disposition.mjs`) so the reviewer audits the rule rather than the rows. `review` means no rule matched and the entry needs human adjudication — it does NOT mean the slot is safe to delete. Every token/style slot a contract declares (from `<Component>.tokens.json` top-level keys + `<Component>.styles.json` dotted property keys) is classified against the generated React structure CSS (`<Component>.css`): **consumed** if `var(--fsds-<slug>)` appears, **dead** otherwise. The declaration site (`<Component>.tokens.css`) is excluded so a slot cannot consume itself. Consumption is scanned in ds-react only (the reference framework); all five web frameworks derive from the same IR, so a slot dead in ds-react is dead everywhere. Advisory this slice — not a CI gate (mirrors `PSEUDO-STATE-STYLING-RAIL-01`'s posture).

Components: **49** · slots declared: **894** · consumed: **761** · **inert: 133** (defects: **116** · inert-by-design: **17**)

## Dead slots — declared slots with no `var()` consumer in the structure CSS

| component | slot | CSS var | disposition | evidence |
|---|---|---|---|---|
| Accordion | `accordion.border.width` | `--fsds-accordion-border-width` | `review` | no rule matched: "width" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Accordion | `accordion.spacing.paddingX` | `--fsds-accordion-spacing-paddingX` | `review` | no rule matched: "paddingX" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Alert | `alert.icon.size` | `--fsds-alert-icon-size` | `review` | no rule matched: "size" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Alert | `alert.size.padding.inline` | `--fsds-alert-size-padding-inline` | `wire` | "inline" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Alert | `alert.size.padding.page` | `--fsds-alert-size-padding-page` | `wire` | "page" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Alert | `alert.typography.page.fontSize` | `--fsds-alert-typography-page-fontSize` | `review` | no rule matched: "fontSize" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Alert | `alert.typography.page.title.fontSize` | `--fsds-alert-typography-page-title-fontSize` | `review` | no rule matched: "fontSize" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Alert | `alert.typography.inline.fontSize` | `--fsds-alert-typography-inline-fontSize` | `review` | no rule matched: "fontSize" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| AlertNotice | `alert-notice.color.background.primary` | `--fsds-alert-notice-color-background-primary` | `review` | no rule matched: "primary" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| AlertNotice | `alert-notice.color.foreground.primary` | `--fsds-alert-notice-color-foreground-primary` | `review` | no rule matched: "primary" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| AlertNotice | `alert-notice.icon.size` | `--fsds-alert-notice-icon-size` | `review` | no rule matched: "size" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| AlertNotice | `alert-notice.size.padding.inline` | `--fsds-alert-notice-size-padding-inline` | `wire` | "inline" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| AlertNotice | `alert-notice.size.padding.page` | `--fsds-alert-notice-size-padding-page` | `wire` | "page" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| AlertNotice | `alert-notice.typography.page.fontSize` | `--fsds-alert-notice-typography-page-fontSize` | `review` | no rule matched: "fontSize" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| AlertNotice | `alert-notice.typography.page.title.fontSize` | `--fsds-alert-notice-typography-page-title-fontSize` | `review` | no rule matched: "fontSize" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| AlertNotice | `alert-notice.typography.inline.fontSize` | `--fsds-alert-notice-typography-inline-fontSize` | `review` | no rule matched: "fontSize" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Avatar | `avatar.color.background.inverse` | `--fsds-avatar-color-background-inverse` | `review` | no rule matched: "inverse" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Blockquote | `blockquote.size.padding.sm` | `--fsds-blockquote-size-padding-sm` | `repoint` | styles["--sm"] redefines sibling "blockquote.size.padding.default" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Blockquote | `blockquote.size.padding.lg` | `--fsds-blockquote-size-padding-lg` | `repoint` | styles["--lg"] redefines sibling "blockquote.size.padding.default" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Blockquote | `blockquote.size.fontSize.sm` | `--fsds-blockquote-size-fontSize-sm` | `repoint` | styles["--sm"] redefines sibling "blockquote.size.fontSize.md" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Blockquote | `blockquote.size.fontSize.lg` | `--fsds-blockquote-size-fontSize-lg` | `repoint` | styles["--lg"] redefines sibling "blockquote.size.fontSize.md" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Button | `button.size.padding-block.medium` | `--fsds-button-size-padding-block-medium` | `unconsumed-vocabulary` | styles["--medium"] redefines this slot per axis value, but no rule reads it — a parallel vocabulary whose consumer reads a different slot family |
| Button | `button.size.padding-inline.medium` | `--fsds-button-size-padding-inline-medium` | `unconsumed-vocabulary` | styles["--medium"] redefines this slot per axis value, but no rule reads it — a parallel vocabulary whose consumer reads a different slot family |
| Button | `button.size.minHeight.medium` | `--fsds-button-size-minHeight-medium` | `unconsumed-vocabulary` | styles["--medium"] redefines this slot per axis value, but no rule reads it — a parallel vocabulary whose consumer reads a different slot family |
| Calendar | `calendar.color.border.accent` | `--fsds-calendar-color-border-accent` | `review` | no rule matched: "accent" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Calendar | `calendar.color.day.range.background` | `--fsds-calendar-color-day-range-background` | `review` | no rule matched: "background" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Calendar | `calendar.typography.weekday.size` | `--fsds-calendar-typography-weekday-size` | `review` | no rule matched: "size" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Card | `card.color.badge.success.background` | `--fsds-card-color-badge-success-background` | `delete` | slot hangs off anatomy part "badge", which the generated component never renders (no .card__badge in the emitted source); nothing can consume it |
| Card | `card.color.badge.success.foreground` | `--fsds-card-color-badge-success-foreground` | `delete` | slot hangs off anatomy part "badge", which the generated component never renders (no .card__badge in the emitted source); nothing can consume it |
| Card | `card.color.badge.warning.background` | `--fsds-card-color-badge-warning-background` | `delete` | slot hangs off anatomy part "badge", which the generated component never renders (no .card__badge in the emitted source); nothing can consume it |
| Card | `card.color.badge.warning.foreground` | `--fsds-card-color-badge-warning-foreground` | `delete` | slot hangs off anatomy part "badge", which the generated component never renders (no .card__badge in the emitted source); nothing can consume it |
| Card | `card.color.badge.info.background` | `--fsds-card-color-badge-info-background` | `delete` | slot hangs off anatomy part "badge", which the generated component never renders (no .card__badge in the emitted source); nothing can consume it |
| Card | `card.color.badge.info.foreground` | `--fsds-card-color-badge-info-foreground` | `delete` | slot hangs off anatomy part "badge", which the generated component never renders (no .card__badge in the emitted source); nothing can consume it |
| Card | `card.color.badge.error.background` | `--fsds-card-color-badge-error-background` | `delete` | slot hangs off anatomy part "badge", which the generated component never renders (no .card__badge in the emitted source); nothing can consume it |
| Card | `card.color.badge.error.foreground` | `--fsds-card-color-badge-error-foreground` | `delete` | slot hangs off anatomy part "badge", which the generated component never renders (no .card__badge in the emitted source); nothing can consume it |
| Card | `card.color.badge.neutral.background` | `--fsds-card-color-badge-neutral-background` | `delete` | slot hangs off anatomy part "badge", which the generated component never renders (no .card__badge in the emitted source); nothing can consume it |
| Card | `card.color.badge.neutral.foreground` | `--fsds-card-color-badge-neutral-foreground` | `delete` | slot hangs off anatomy part "badge", which the generated component never renders (no .card__badge in the emitted source); nothing can consume it |
| Chip | `chip.color.background.active` | `--fsds-chip-color-background-active` | `wire` | "active" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Chip | `chip.focus.ring.width` | `--fsds-chip-focus-ring-width` | `review` | no rule matched: "width" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Chip | `chip.focus.ring.color` | `--fsds-chip-focus-ring-color` | `review` | no rule matched: "color" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Chip | `chip.focus.ring.style` | `--fsds-chip-focus-ring-style` | `review` | no rule matched: "style" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Chip | `chip.focus.ring.offset` | `--fsds-chip-focus-ring-offset` | `review` | no rule matched: "offset" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Chip | `chip.color.background.selected` | `--fsds-chip-color-background-selected` | `repoint` | styles["--selected"] redefines sibling "chip.color.background.default" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Chip | `chip.color.foreground.selected` | `--fsds-chip-color-foreground-selected` | `repoint` | styles["--selected"] redefines sibling "chip.color.foreground.default" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Chip | `chip.color.border.selected` | `--fsds-chip-color-border-selected` | `repoint` | styles["--selected"] redefines sibling "chip.color.border.default" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Command | `command.opacity.disabled` | `--fsds-command-opacity-disabled` | `wire` | "disabled" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Details | `details.size.padding.compact` | `--fsds-details-size-padding-compact` | `repoint` | styles["--compact"] redefines sibling "details.size.padding.default" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Details | `details.size.padding.page` | `--fsds-details-size-padding-page` | `review` | no rule matched: "page" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Details | `details.typography.fontSize.body` | `--fsds-details-typography-fontSize-body` | `review` | no rule matched: "body" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Details | `details.typography.fontSize.compact` | `--fsds-details-typography-fontSize-compact` | `wire` | "compact" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Divider | `divider.size.thicknessThick` | `--fsds-divider-size-thicknessThick` | `review` | no rule matched: "thicknessThick" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Field | `field.pad.y` | `--fsds-field-pad-y` | `review` | no rule matched: "y" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Field | `field.color.borderBold` | `--fsds-field-color-borderBold` | `review` | no rule matched: "borderBold" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Field | `field.color.validating-border` | `--fsds-field-color-validating-border` | `review` | no rule matched: "validating-border" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Field | `field.color.validating-text` | `--fsds-field-color-validating-text` | `review` | no rule matched: "validating-text" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Field | `field.color.valid-text` | `--fsds-field-color-valid-text` | `review` | no rule matched: "valid-text" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Field | `field.spacing.indicator` | `--fsds-field-spacing-indicator` | `review` | no rule matched: "indicator" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Image | `image.size.icon` | `--fsds-image-size-icon` | `review` | no rule matched: "icon" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Image | `image.typography.error.fontSize` | `--fsds-image-typography-error-fontSize` | `review` | no rule matched: "fontSize" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Input | `input.space.inline.default` | `--fsds-input-space-inline-default` | `wire` | "default" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Label | `label.typo.weight.default` | `--fsds-label-typo-weight-default` | `wire` | "default" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Links | `links.size.fontSize.small` | `--fsds-links-size-fontSize-small` | `repoint` | styles["--small"] redefines sibling "links.size.fontSize.medium" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Links | `links.size.fontSize.large` | `--fsds-links-size-fontSize-large` | `repoint` | styles["--large"] redefines sibling "links.size.fontSize.medium" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| NavList | `nav-list.color.background.default` | `--fsds-nav-list-color-background-default` | `wire` | "default" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| NavList | `nav-list.color.background.hover` | `--fsds-nav-list-color-background-hover` | `wire` | "hover" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| NavList | `nav-list.color.background.current` | `--fsds-nav-list-color-background-current` | `review` | no rule matched: "current" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| NavList | `nav-list.color.outline.focus` | `--fsds-nav-list-color-outline-focus` | `wire` | "focus" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| NavList | `nav-list.size.gap.group` | `--fsds-nav-list-size-gap-group` | `review` | no rule matched: "group" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| NavList | `nav-list.size.fontSize.item` | `--fsds-nav-list-size-fontSize-item` | `review` | no rule matched: "item" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| NavList | `nav-list.size.fontSize.groupLabel` | `--fsds-nav-list-size-fontSize-groupLabel` | `review` | no rule matched: "groupLabel" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| OTP | `otp.size.padding.default` | `--fsds-otp-size-padding-default` | `wire` | "default" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Postcard | `postcard.size.radius.full` | `--fsds-postcard-size-radius-full` | `review` | no rule matched: "full" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| ProfileFlag | `profile-flag.spacing.padding.default` | `--fsds-profile-flag-spacing-padding-default` | `wire` | "default" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Select | `select.color.icon.default` | `--fsds-select-color-icon-default` | `wire` | "default" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Select | `select.color.icon.isOpen` | `--fsds-select-color-icon-isOpen` | `review` | no rule matched: "isOpen" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Sheet | `sheet.focus.width` | `--fsds-sheet-focus-width` | `review` | no rule matched: "width" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Sheet | `sheet.focus.color` | `--fsds-sheet-focus-color` | `review` | no rule matched: "color" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Sheet | `sheet.color.backgroundHover` | `--fsds-sheet-color-backgroundHover` | `review` | no rule matched: "backgroundHover" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| ShowMore | `show-more.color.border.default` | `--fsds-show-more-color-border-default` | `wire` | "default" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| ShowMore | `show-more.color.border.accent` | `--fsds-show-more-color-border-accent` | `review` | no rule matched: "accent" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| ShowMore | `show-more.overlay.imageOverlay` | `--fsds-show-more-overlay-imageOverlay` | `review` | no rule matched: "imageOverlay" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Shuttle | `shuttle.color.border.default` | `--fsds-shuttle-color-border-default` | `wire` | "default" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Skeleton | `skeleton.color.static` | `--fsds-skeleton-color-static` | `review` | no rule matched: "static" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Skeleton | `skeleton.radius.sm` | `--fsds-skeleton-radius-sm` | `review` | no rule matched: "sm" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Skeleton | `skeleton.radius.lg` | `--fsds-skeleton-radius-lg` | `review` | no rule matched: "lg" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Skeleton | `skeleton.radius.full` | `--fsds-skeleton-radius-full` | `review` | no rule matched: "full" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Skeleton | `skeleton.gap.compact` | `--fsds-skeleton-gap-compact` | `repoint` | styles["--compact"] redefines sibling "skeleton.gap.md" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Skeleton | `skeleton.gap.spacious` | `--fsds-skeleton-gap-spacious` | `repoint` | styles["--spacious"] redefines sibling "skeleton.gap.md" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Stat | `stat.color.foreground.label` | `--fsds-stat-color-foreground-label` | `review` | no rule matched: "label" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Stat | `stat.size.label` | `--fsds-stat-size-label` | `review` | no rule matched: "label" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Stat | `stat.size.gap` | `--fsds-stat-size-gap` | `review` | no rule matched: "gap" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Stat | `stat.typography.weight.label` | `--fsds-stat-typography-weight-label` | `review` | no rule matched: "label" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Table | `table.color.textMuted` | `--fsds-table-color-textMuted` | `review` | no rule matched: "textMuted" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Table | `table.spacing.sortGap` | `--fsds-table-spacing-sortGap` | `review` | no rule matched: "sortGap" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Table | `table.size.cellHeight` | `--fsds-table-size-cellHeight` | `review` | no rule matched: "cellHeight" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Table | `table.focus.width` | `--fsds-table-focus-width` | `review` | no rule matched: "width" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Table | `table.focus.color` | `--fsds-table-focus-color` | `review` | no rule matched: "color" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Table | `table.focus.offset` | `--fsds-table-focus-offset` | `review` | no rule matched: "offset" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Tabs | `tabs.color.focus` | `--fsds-tabs-color-focus` | `wire` | "focus" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Tabs | `tabs.size.vertical.listWidth` | `--fsds-tabs-size-vertical-listWidth` | `review` | no rule matched: "listWidth" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Text | `text.size.xs` | `--fsds-text-size-xs` | `repoint` | styles["--xs"] redefines sibling "text.size.md" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Text | `text.size.sm` | `--fsds-text-size-sm` | `repoint` | styles["--sm"] redefines sibling "text.size.md" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Text | `text.size.lg` | `--fsds-text-size-lg` | `repoint` | styles["--lg"] redefines sibling "text.size.md" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Text | `text.size.xl` | `--fsds-text-size-xl` | `repoint` | styles["--xl"] redefines sibling "text.size.md" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Text | `text.size.2xl` | `--fsds-text-size-2xl` | `repoint` | styles["--2xl"] redefines sibling "text.size.md" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Text | `text.size.3xl` | `--fsds-text-size-3xl` | `repoint` | styles["--3xl"] redefines sibling "text.size.md" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit |
| Toast | `toast.accent.default` | `--fsds-toast-accent-default` | `wire` | "default" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing |
| Toast | `toast.color.intent.bg` | `--fsds-toast-color-intent-bg` | `review` | no rule matched: "bg" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Toast | `toast.color.intent.border` | `--fsds-toast-color-intent-border` | `review` | no rule matched: "border" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Toast | `toast.motion.enter` | `--fsds-toast-motion-enter` | `review` | no rule matched: "enter" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Toast | `toast.motion.leave` | `--fsds-toast-motion-leave` | `review` | no rule matched: "leave" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Toast | `toast.timing.auto-dismiss` | `--fsds-toast-timing-auto-dismiss` | `review` | no rule matched: "auto-dismiss" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Tooltip | `tooltip.size.padding.y` | `--fsds-tooltip-size-padding-y` | `review` | no rule matched: "y" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Truncate | `truncate.color.background.primary` | `--fsds-truncate-color-background-primary` | `review` | no rule matched: "primary" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Truncate | `truncate.color.foreground.linkHover` | `--fsds-truncate-color-foreground-linkHover` | `review` | no rule matched: "linkHover" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |
| Walkthrough | `walkthrough.dots.active` | `--fsds-walkthrough-dots-active` | `review` | no rule matched: "active" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication |

## Full matrix (per component)

### Accordion  `.accordion`

declared: **22** · consumed: **19** · dead: **2**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `accordion.color.background.hover` | `--fsds-accordion-color-background-hover` | ✓ consumed | `tokens` |
| `accordion.color.text` | `--fsds-accordion-color-text` | ✓ consumed | `tokens` |
| `accordion.color.textSecondary` | `--fsds-accordion-color-textSecondary` | ✓ consumed | `tokens` |
| `accordion.color.icon` | `--fsds-accordion-color-icon` | ✓ consumed | `tokens` |
| `accordion.border.width` | `--fsds-accordion-border-width` | ✗ dead | `tokens` |
| `accordion.border.color` | `--fsds-accordion-border-color` | ✓ consumed | `tokens` |
| `accordion.border.radius` | `--fsds-accordion-border-radius` | ✓ consumed | `tokens` |
| `accordion.spacing.gap` | `--fsds-accordion-spacing-gap` | ✓ consumed | `tokens` |
| `accordion.spacing.paddingX` | `--fsds-accordion-spacing-paddingX` | ✗ dead | `tokens` |
| `accordion.spacing.paddingY` | `--fsds-accordion-spacing-paddingY` | ✓ consumed | `tokens` |
| `accordion.text.weight` | `--fsds-accordion-text-weight` | ✓ consumed | `tokens` |
| `accordion.text.size` | `--fsds-accordion-text-size` | ✓ consumed | `tokens` |
| `accordion.text.lineHeight` | `--fsds-accordion-text-lineHeight` | ✓ consumed | `tokens` |
| `accordion.text.sizeContent` | `--fsds-accordion-text-sizeContent` | ✓ consumed | `tokens` |
| `accordion.text.lineHeightContent` | `--fsds-accordion-text-lineHeightContent` | ✓ consumed | `tokens` |
| `accordion.icon.size` | `--fsds-accordion-icon-size` | ✓ consumed | `tokens` |
| `accordion.focus.width` | `--fsds-accordion-focus-width` | ✓ consumed | `tokens` |
| `accordion.focus.color` | `--fsds-accordion-focus-color` | ✓ consumed | `tokens` |
| `accordion.focus.offset` | `--fsds-accordion-focus-offset` | ✓ consumed | `tokens` |
| `accordion.opacity.disabled` | `--fsds-accordion-opacity-disabled` | ✓ consumed | `tokens` |
| `accordion.color.textHover` | `--fsds-accordion-color-textHover` | ✓ consumed | `tokens` |

### Alert  `.alert`

declared: **21** · consumed: **14** · dead: **6**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `alert.color.background.primary` | `--fsds-alert-color-background-primary` | ✓ consumed | `tokens` |
| `alert.color.foreground.primary` | `--fsds-alert-color-foreground-primary` | ✓ consumed | `tokens` |
| `alert.color.border.primary` | `--fsds-alert-color-border-primary` | ✓ consumed | `tokens` |
| `alert.size.padding` | `--fsds-alert-size-padding` | ✓ consumed | `tokens` |
| `alert.size.radius` | `--fsds-alert-size-radius` | ✓ consumed | `tokens` |
| `alert.spacing.gap` | `--fsds-alert-spacing-gap` | ✓ consumed | `tokens` |
| `alert.text.size` | `--fsds-alert-text-size` | ✓ consumed | `tokens` |
| `alert.text.weight` | `--fsds-alert-text-weight` | ✓ consumed | `tokens` |
| `alert.icon.size` | `--fsds-alert-icon-size` | ✗ dead | `tokens` |
| `alert.typography.title.fontWeight` | `--fsds-alert-typography-title-fontWeight` | ✓ consumed | `tokens` |
| `alert.typography.title.fontSize` | `--fsds-alert-typography-title-fontSize` | ✓ consumed | `tokens` |
| `alert.size.padding.inline` | `--fsds-alert-size-padding-inline` | ✗ dead | `tokens` |
| `alert.size.padding.page` | `--fsds-alert-size-padding-page` | ✗ dead | `tokens` |
| `alert.typography.page.fontSize` | `--fsds-alert-typography-page-fontSize` | ✗ dead | `tokens` |
| `alert.typography.page.title.fontSize` | `--fsds-alert-typography-page-title-fontSize` | ✗ dead | `tokens` |
| `alert.typography.inline.fontSize` | `--fsds-alert-typography-inline-fontSize` | ✗ dead | `tokens` |

### AlertNotice  `.alert-notice`

declared: **32** · consumed: **23** · dead: **8**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `alert-notice.color.background.primary` | `--fsds-alert-notice-color-background-primary` | ✗ dead | `tokens` |
| `alert-notice.color.foreground.primary` | `--fsds-alert-notice-color-foreground-primary` | ✗ dead | `tokens` |
| `alert-notice.color.background.info` | `--fsds-alert-notice-color-background-info` | ✓ consumed | `tokens` |
| `alert-notice.color.background.success` | `--fsds-alert-notice-color-background-success` | ✓ consumed | `tokens` |
| `alert-notice.color.background.warning` | `--fsds-alert-notice-color-background-warning` | ✓ consumed | `tokens` |
| `alert-notice.color.background.danger` | `--fsds-alert-notice-color-background-danger` | ✓ consumed | `tokens` |
| `alert-notice.color.foreground.info` | `--fsds-alert-notice-color-foreground-info` | ✓ consumed | `tokens` |
| `alert-notice.color.foreground.success` | `--fsds-alert-notice-color-foreground-success` | ✓ consumed | `tokens` |
| `alert-notice.color.foreground.warning` | `--fsds-alert-notice-color-foreground-warning` | ✓ consumed | `tokens` |
| `alert-notice.color.foreground.danger` | `--fsds-alert-notice-color-foreground-danger` | ✓ consumed | `tokens` |
| `alert-notice.color.border.info` | `--fsds-alert-notice-color-border-info` | ✓ consumed | `tokens` |
| `alert-notice.color.border.success` | `--fsds-alert-notice-color-border-success` | ✓ consumed | `tokens` |
| `alert-notice.color.border.warning` | `--fsds-alert-notice-color-border-warning` | ✓ consumed | `tokens` |
| `alert-notice.color.border.danger` | `--fsds-alert-notice-color-border-danger` | ✓ consumed | `tokens` |
| `alert-notice.size.padding` | `--fsds-alert-notice-size-padding` | ✓ consumed | `tokens` |
| `alert-notice.size.radius` | `--fsds-alert-notice-size-radius` | ✓ consumed | `tokens` |
| `alert-notice.spacing.gap` | `--fsds-alert-notice-spacing-gap` | ✓ consumed | `tokens` |
| `alert-notice.text.size` | `--fsds-alert-notice-text-size` | ✓ consumed | `tokens` |
| `alert-notice.text.weight` | `--fsds-alert-notice-text-weight` | ✓ consumed | `tokens` |
| `alert-notice.icon.size` | `--fsds-alert-notice-icon-size` | ✗ dead | `tokens` |
| `alert-notice.typography.title.fontWeight` | `--fsds-alert-notice-typography-title-fontWeight` | ✓ consumed | `tokens` |
| `alert-notice.typography.title.fontSize` | `--fsds-alert-notice-typography-title-fontSize` | ✓ consumed | `tokens` |
| `alert-notice.size.padding.inline` | `--fsds-alert-notice-size-padding-inline` | ✗ dead | `tokens` |
| `alert-notice.size.padding.page` | `--fsds-alert-notice-size-padding-page` | ✗ dead | `tokens` |
| `alert-notice.typography.page.fontSize` | `--fsds-alert-notice-typography-page-fontSize` | ✗ dead | `tokens` |
| `alert-notice.typography.page.title.fontSize` | `--fsds-alert-notice-typography-page-title-fontSize` | ✗ dead | `tokens` |
| `alert-notice.typography.inline.fontSize` | `--fsds-alert-notice-typography-inline-fontSize` | ✗ dead | `tokens` |

### Avatar  `.avatar`

declared: **13** · consumed: **12** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `avatar.size.default` | `--fsds-avatar-size-default` | ✓ consumed | `tokens` |
| `avatar.size.small` | `--fsds-avatar-size-small` | ✓ consumed | `tokens` |
| `avatar.size.medium` | `--fsds-avatar-size-medium` | ✓ consumed | `tokens` |
| `avatar.size.large` | `--fsds-avatar-size-large` | ✓ consumed | `tokens` |
| `avatar.size.extra-large` | `--fsds-avatar-size-extra-large` | ✓ consumed | `tokens` |
| `avatar.size.radius.default` | `--fsds-avatar-size-radius-default` | ✓ consumed | `tokens` |
| `avatar.size.border.default` | `--fsds-avatar-size-border-default` | ✓ consumed | `tokens` |
| `avatar.color.background.default` | `--fsds-avatar-color-background-default` | ✓ consumed | `tokens` |
| `avatar.color.background.inverse` | `--fsds-avatar-color-background-inverse` | ✗ dead | `tokens` |
| `avatar.color.foreground.primary` | `--fsds-avatar-color-foreground-primary` | ✓ consumed | `tokens` |
| `avatar.color.border.default` | `--fsds-avatar-color-border-default` | ✓ consumed | `tokens` |
| `avatar.typography.fontWeight.medium` | `--fsds-avatar-typography-fontWeight-medium` | ✓ consumed | `tokens` |
| `avatar.typography.fontFamily.sans` | `--fsds-avatar-typography-fontFamily-sans` | ✓ consumed | `tokens` |

### Badge  `.badge`

declared: **12** · consumed: **12** · dead: **0**

### Blockquote  `.blockquote`

declared: **19** · consumed: **15** · dead: **4**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `box-model.min-width` | `--fsds-box-model-min-width` | ✓ consumed | `tokens` |
| `blockquote.color.foreground.primary` | `--fsds-blockquote-color-foreground-primary` | ✓ consumed | `tokens` |
| `blockquote.color.background.default` | `--fsds-blockquote-color-background-default` | ✓ consumed | `tokens` |
| `blockquote.color.border.default` | `--fsds-blockquote-color-border-default` | ✓ consumed | `tokens` |
| `blockquote.typography.fontStyle` | `--fsds-blockquote-typography-fontStyle` | ✓ consumed | `tokens` |
| `blockquote.typography.fontWeight` | `--fsds-blockquote-typography-fontWeight` | ✓ consumed | `tokens` |
| `blockquote.size.padding.default` | `--fsds-blockquote-size-padding-default` | ✓ consumed | `tokens` |
| `blockquote.size.padding.sm` | `--fsds-blockquote-size-padding-sm` | ✗ dead | `tokens` |
| `blockquote.size.padding.lg` | `--fsds-blockquote-size-padding-lg` | ✗ dead | `tokens` |
| `blockquote.size.radius.default` | `--fsds-blockquote-size-radius-default` | ✓ consumed | `tokens` |
| `blockquote.size.border.thick` | `--fsds-blockquote-size-border-thick` | ✓ consumed | `tokens` |
| `blockquote.size.fontSize.sm` | `--fsds-blockquote-size-fontSize-sm` | ✗ dead | `tokens` |
| `blockquote.size.fontSize.md` | `--fsds-blockquote-size-fontSize-md` | ✓ consumed | `tokens` |
| `blockquote.size.fontSize.lg` | `--fsds-blockquote-size-fontSize-lg` | ✗ dead | `tokens` |

### Breadcrumbs  `.breadcrumbs`

declared: **9** · consumed: **9** · dead: **0**

### Button  `.button`

declared: **26** · consumed: **22** · dead: **3**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `box-model.min-height` | `--fsds-box-model-min-height` | ✓ consumed | `tokens` |
| `box-model.min-width` | `--fsds-box-model-min-width` | ✓ consumed | `tokens` |
| `button.color.background.default` | `--fsds-button-color-background-default` | ✓ consumed | `tokens` |
| `button.color.background.hover` | `--fsds-button-color-background-hover` | ✓ consumed | `tokens` |
| `button.color.background.active` | `--fsds-button-color-background-active` | ✓ consumed | `tokens` |
| `button.color.background.disabled` | `--fsds-button-color-background-disabled` | ✓ consumed | `tokens` |
| `button.color.foreground.default` | `--fsds-button-color-foreground-default` | ✓ consumed | `tokens` |
| `button.color.foreground.disabled` | `--fsds-button-color-foreground-disabled` | ✓ consumed | `tokens` |
| `button.color.border.default` | `--fsds-button-color-border-default` | ✓ consumed | `tokens` |
| `button.color.border.hover` | `--fsds-button-color-border-hover` | ✓ consumed | `tokens` |
| `button.color.border.focus` | `--fsds-button-color-border-focus` | ✓ consumed | `tokens` |
| `button.size.gap.default` | `--fsds-button-size-gap-default` | ✓ consumed | `tokens` |
| `button.size.radius` | `--fsds-button-size-radius` | ✓ consumed | `tokens` |
| `button.size.border` | `--fsds-button-size-border` | ✓ consumed | `tokens` |
| `button.text.weight` | `--fsds-button-text-weight` | ✓ consumed | `tokens` |
| `button.motion.duration.fast` | `--fsds-button-motion-duration-fast` | ✓ consumed | `tokens` |
| `button.motion.easing.standard` | `--fsds-button-motion-easing-standard` | ✓ consumed | `tokens` |
| `button.size.padding-block.medium` | `--fsds-button-size-padding-block-medium` | ✗ dead | `tokens` |
| `button.size.padding-inline.medium` | `--fsds-button-size-padding-inline-medium` | ✗ dead | `tokens` |
| `button.size.minHeight.medium` | `--fsds-button-size-minHeight-medium` | ✗ dead | `tokens` |
| `button.size.fontSize.medium` | `--fsds-button-size-fontSize-medium` | ✓ consumed | `tokens` |

### Calendar  `.calendar`

declared: **23** · consumed: **20** · dead: **3**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `calendar.color.background.default` | `--fsds-calendar-color-background-default` | ✓ consumed | `tokens` |
| `calendar.color.foreground.primary` | `--fsds-calendar-color-foreground-primary` | ✓ consumed | `tokens` |
| `calendar.color.foreground.muted` | `--fsds-calendar-color-foreground-muted` | ✓ consumed | `tokens` |
| `calendar.color.border.default` | `--fsds-calendar-color-border-default` | ✓ consumed | `tokens` |
| `calendar.color.border.accent` | `--fsds-calendar-color-border-accent` | ✗ dead | `tokens` |
| `calendar.color.day.hover` | `--fsds-calendar-color-day-hover` | ✓ consumed | `tokens` |
| `calendar.color.day.selected.background` | `--fsds-calendar-color-day-selected-background` | ✓ consumed | `tokens` |
| `calendar.color.day.selected.foreground` | `--fsds-calendar-color-day-selected-foreground` | ✓ consumed | `tokens` |
| `calendar.color.day.range.background` | `--fsds-calendar-color-day-range-background` | ✗ dead | `tokens` |
| `calendar.color.today.ring` | `--fsds-calendar-color-today-ring` | ✓ consumed | `tokens` |
| `calendar.color.focus.ring` | `--fsds-calendar-color-focus-ring` | ✓ consumed | `tokens` |
| `calendar.size.padding.default` | `--fsds-calendar-size-padding-default` | ✓ consumed | `tokens` |
| `calendar.size.cell` | `--fsds-calendar-size-cell` | ✓ consumed | `tokens` |
| `calendar.size.nav` | `--fsds-calendar-size-nav` | ✓ consumed | `tokens` |
| `calendar.size.radius.default` | `--fsds-calendar-size-radius-default` | ✓ consumed | `tokens` |
| `calendar.size.radius.day` | `--fsds-calendar-size-radius-day` | ✓ consumed | `tokens` |
| `calendar.typography.caption.size` | `--fsds-calendar-typography-caption-size` | ✓ consumed | `tokens` |
| `calendar.typography.day.size` | `--fsds-calendar-typography-day-size` | ✓ consumed | `tokens` |
| `calendar.typography.weekday.size` | `--fsds-calendar-typography-weekday-size` | ✗ dead | `tokens` |
| `calendar.focus.ring.width` | `--fsds-calendar-focus-ring-width` | ✓ consumed | `tokens` |
| `calendar.focus.ring.offset` | `--fsds-calendar-focus-ring-offset` | ✓ consumed | `tokens` |
| `calendar.elevation.default` | `--fsds-calendar-elevation-default` | ✓ consumed | `tokens` |

### Card  `.card`

declared: **35** · consumed: **24** · dead: **10**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `box-model.min-width` | `--fsds-box-model-min-width` | ✓ consumed | `tokens` |
| `card.color.background.default` | `--fsds-card-color-background-default` | ✓ consumed | `tokens` |
| `card.color.background.hover` | `--fsds-card-color-background-hover` | ✓ consumed | `tokens` |
| `card.color.border.default` | `--fsds-card-color-border-default` | ✓ consumed | `tokens` |
| `card.color.foreground.primary` | `--fsds-card-color-foreground-primary` | ✓ consumed | `tokens` |
| `card.size.padding.default` | `--fsds-card-size-padding-default` | ✓ consumed | `tokens` |
| `card.size.padding.inset` | `--fsds-card-size-padding-inset` | ✓ consumed | `tokens` |
| `card.size.radius.default` | `--fsds-card-size-radius-default` | ✓ consumed | `tokens` |
| `card.size.gap.default` | `--fsds-card-size-gap-default` | ✓ consumed | `tokens` |
| `card.typography.lineHeight.heading` | `--fsds-card-typography-lineHeight-heading` | ✓ consumed | `tokens` |
| `card.typography.lineHeight.normal` | `--fsds-card-typography-lineHeight-normal` | ✓ consumed | `tokens` |
| `card.color.badge.success.background` | `--fsds-card-color-badge-success-background` | ✗ dead | `tokens` |
| `card.color.badge.success.foreground` | `--fsds-card-color-badge-success-foreground` | ✗ dead | `tokens` |
| `card.color.badge.warning.background` | `--fsds-card-color-badge-warning-background` | ✗ dead | `tokens` |
| `card.color.badge.warning.foreground` | `--fsds-card-color-badge-warning-foreground` | ✗ dead | `tokens` |
| `card.color.badge.info.background` | `--fsds-card-color-badge-info-background` | ✗ dead | `tokens` |
| `card.color.badge.info.foreground` | `--fsds-card-color-badge-info-foreground` | ✗ dead | `tokens` |
| `card.color.badge.error.background` | `--fsds-card-color-badge-error-background` | ✗ dead | `tokens` |
| `card.color.badge.error.foreground` | `--fsds-card-color-badge-error-foreground` | ✗ dead | `tokens` |
| `card.color.badge.neutral.background` | `--fsds-card-color-badge-neutral-background` | ✗ dead | `tokens` |
| `card.color.badge.neutral.foreground` | `--fsds-card-color-badge-neutral-foreground` | ✗ dead | `tokens` |
| `card.color.badge.accent.background` | `--fsds-card-color-badge-accent-background` | ✓ consumed | `tokens` |
| `card.color.badge.accent.foreground` | `--fsds-card-color-badge-accent-foreground` | ✓ consumed | `tokens` |
| `card.color.statusAccent.default` | `--fsds-card-color-statusAccent-default` | ✓ consumed | `tokens` |
| `card.size.statusAccent.width` | `--fsds-card-size-statusAccent-width` | ✓ consumed | `tokens` |
| `card.elevation.resting` | `--fsds-card-elevation-resting` | ✓ consumed | `tokens` |
| `card.elevation.raised` | `--fsds-card-elevation-raised` | ✓ consumed | `tokens` |
| `card.color.focus.ring` | `--fsds-card-color-focus-ring` | ✓ consumed | `tokens` |
| `card.focus.ring.width` | `--fsds-card-focus-ring-width` | ✓ consumed | `tokens` |
| `card.focus.ring.offset` | `--fsds-card-focus-ring-offset` | ✓ consumed | `tokens` |

### Checkbox  `.checkbox`

declared: **15** · consumed: **15** · dead: **0**

### Chip  `.chip`

declared: **32** · consumed: **22** · dead: **8**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `chip.color.background.default` | `--fsds-chip-color-background-default` | ✓ consumed | `tokens` |
| `chip.color.background.hover` | `--fsds-chip-color-background-hover` | ✓ consumed | `tokens` |
| `chip.color.background.active` | `--fsds-chip-color-background-active` | ✗ dead | `tokens` |
| `chip.color.foreground.default` | `--fsds-chip-color-foreground-default` | ✓ consumed | `tokens` |
| `chip.color.border.default` | `--fsds-chip-color-border-default` | ✓ consumed | `tokens` |
| `chip.size.padding.horizontal` | `--fsds-chip-size-padding-horizontal` | ✓ consumed | `tokens` |
| `chip.size.padding.vertical` | `--fsds-chip-size-padding-vertical` | ✓ consumed | `tokens` |
| `chip.size.gap` | `--fsds-chip-size-gap` | ✓ consumed | `tokens` |
| `chip.size.radius` | `--fsds-chip-size-radius` | ✓ consumed | `tokens` |
| `chip.size.border` | `--fsds-chip-size-border` | ✓ consumed | `tokens` |
| `chip.text.size` | `--fsds-chip-text-size` | ✓ consumed | `tokens` |
| `chip.text.weight` | `--fsds-chip-text-weight` | ✓ consumed | `tokens` |
| `chip.motion.duration.fast` | `--fsds-chip-motion-duration-fast` | ✓ consumed | `tokens` |
| `chip.focus.ring.width` | `--fsds-chip-focus-ring-width` | ✗ dead | `tokens` |
| `chip.focus.ring.color` | `--fsds-chip-focus-ring-color` | ✗ dead | `tokens` |
| `chip.focus.ring.style` | `--fsds-chip-focus-ring-style` | ✗ dead | `tokens` |
| `chip.focus.ring.offset` | `--fsds-chip-focus-ring-offset` | ✗ dead | `tokens` |
| `chip.size.minHeight` | `--fsds-chip-size-minHeight` | ✓ consumed | `tokens` |
| `chip.color.background.selected` | `--fsds-chip-color-background-selected` | ✗ dead | `tokens` |
| `chip.color.foreground.selected` | `--fsds-chip-color-foreground-selected` | ✗ dead | `tokens` |
| `chip.color.border.selected` | `--fsds-chip-color-border-selected` | ✗ dead | `tokens` |
| `chip.dismiss.size` | `--fsds-chip-dismiss-size` | ✓ consumed | `tokens` |
| `chip.dismiss.gap` | `--fsds-chip-dismiss-gap` | ✓ consumed | `tokens` |
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `styles:.chip__action.button` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `styles:.chip__action.button` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `styles:.chip__action.button` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `styles:.chip__action.button` |
| `box-model.min-height` | `--fsds-box-model-min-height` | ✗ dead | `styles:.chip__action.button` |
| `box-model.min-width` | `--fsds-box-model-min-width` | ✓ consumed | `styles:.chip__action.button` |
| `box-model.width` | `--fsds-box-model-width` | ✓ consumed | `styles:.chip__dismiss.button` |
| `box-model.height` | `--fsds-box-model-height` | ✓ consumed | `styles:.chip__dismiss.button` |

### CodeBlock  `.code-block`

declared: **13** · consumed: **13** · dead: **0**

### CodeSnippet  `.code-snippet`

declared: **15** · consumed: **15** · dead: **0**

### Command  `.command`

declared: **19** · consumed: **18** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `command.color.overlay` | `--fsds-command-color-overlay` | ✓ consumed | `tokens` |
| `command.color.background` | `--fsds-command-color-background` | ✓ consumed | `tokens` |
| `command.color.border` | `--fsds-command-color-border` | ✓ consumed | `tokens` |
| `command.color.borderLight` | `--fsds-command-color-borderLight` | ✓ consumed | `tokens` |
| `command.color.text` | `--fsds-command-color-text` | ✓ consumed | `tokens` |
| `command.color.textMuted` | `--fsds-command-color-textMuted` | ✓ consumed | `tokens` |
| `command.border.width` | `--fsds-command-border-width` | ✓ consumed | `tokens` |
| `command.border.radius` | `--fsds-command-border-radius` | ✓ consumed | `tokens` |
| `command.size.maxWidth` | `--fsds-command-size-maxWidth` | ✓ consumed | `tokens` |
| `command.size.maxHeight` | `--fsds-command-size-maxHeight` | ✓ consumed | `tokens` |
| `command.size.topOffset` | `--fsds-command-size-topOffset` | ✓ consumed | `tokens` |
| `command.size.icon` | `--fsds-command-size-icon` | ✓ consumed | `tokens` |
| `command.spacing.dialogPadding` | `--fsds-command-spacing-dialogPadding` | ✓ consumed | `tokens` |
| `command.text.size` | `--fsds-command-text-size` | ✓ consumed | `tokens` |
| `command.text.sizeSmall` | `--fsds-command-text-sizeSmall` | ✓ consumed | `tokens` |
| `command.shadow` | `--fsds-command-shadow` | ✓ consumed | `tokens` |
| `command.opacity.disabled` | `--fsds-command-opacity-disabled` | ✗ dead | `tokens` |
| `command.color.backgroundHover` | `--fsds-command-color-backgroundHover` | ✓ consumed | `tokens` |

### Details  `.details`

declared: **19** · consumed: **14** · dead: **4**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `details.size.padding.default` | `--fsds-details-size-padding-default` | ✓ consumed | `tokens` |
| `details.size.radius.default` | `--fsds-details-size-radius-default` | ✓ consumed | `tokens` |
| `details.size.icon` | `--fsds-details-size-icon` | ✓ consumed | `tokens` |
| `details.color.background.default` | `--fsds-details-color-background-default` | ✓ consumed | `tokens` |
| `details.color.background.hover` | `--fsds-details-color-background-hover` | ✓ consumed | `tokens` |
| `details.color.foreground.primary` | `--fsds-details-color-foreground-primary` | ✓ consumed | `tokens` |
| `details.color.border.default` | `--fsds-details-color-border-default` | ✓ consumed | `tokens` |
| `details.color.border.hover` | `--fsds-details-color-border-hover` | ✓ consumed | `tokens` |
| `details.focus.ring.width` | `--fsds-details-focus-ring-width` | ✓ consumed | `tokens` |
| `details.focus.ring.color` | `--fsds-details-focus-ring-color` | ✓ consumed | `tokens` |
| `details.focus.ring.offset` | `--fsds-details-focus-ring-offset` | ✓ consumed | `tokens` |
| `details.spacing.gap.default` | `--fsds-details-spacing-gap-default` | ✓ consumed | `tokens` |
| `details.typography.lineHeight.body` | `--fsds-details-typography-lineHeight-body` | ✓ consumed | `tokens` |
| `details.typography.fontWeight.medium` | `--fsds-details-typography-fontWeight-medium` | ✓ consumed | `tokens` |
| `details.size.padding.compact` | `--fsds-details-size-padding-compact` | ✗ dead | `tokens` |
| `details.size.padding.page` | `--fsds-details-size-padding-page` | ✗ dead | `tokens` |
| `details.typography.fontSize.body` | `--fsds-details-typography-fontSize-body` | ✗ dead | `tokens` |
| `details.typography.fontSize.compact` | `--fsds-details-typography-fontSize-compact` | ✗ dead | `tokens` |

### Dialog  `.dialog`

declared: **28** · consumed: **28** · dead: **0**

### Divider  `.divider`

declared: **5** · consumed: **4** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `divider.color.default` | `--fsds-divider-color-default` | ✓ consumed | `tokens` |
| `divider.size.thickness` | `--fsds-divider-size-thickness` | ✓ consumed | `tokens` |
| `divider.size.thicknessThick` | `--fsds-divider-size-thicknessThick` | ✗ dead | `tokens` |
| `divider.spacing.margin` | `--fsds-divider-spacing-margin` | ✓ consumed | `tokens` |

### Field  `.field`

declared: **29** · consumed: **22** · dead: **6**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `box-model.min-height` | `--fsds-box-model-min-height` | ✓ consumed | `tokens` |
| `field.gap.y` | `--fsds-field-gap-y` | ✓ consumed | `tokens` |
| `field.gap.meta` | `--fsds-field-gap-meta` | ✓ consumed | `tokens` |
| `field.radius` | `--fsds-field-radius` | ✓ consumed | `tokens` |
| `field.pad.x` | `--fsds-field-pad-x` | ✓ consumed | `tokens` |
| `field.pad.y` | `--fsds-field-pad-y` | ✗ dead | `tokens` |
| `field.color.bg` | `--fsds-field-color-bg` | ✓ consumed | `tokens` |
| `field.color.fg` | `--fsds-field-color-fg` | ✓ consumed | `tokens` |
| `field.color.border` | `--fsds-field-color-border` | ✓ consumed | `tokens` |
| `field.color.borderBold` | `--fsds-field-color-borderBold` | ✗ dead | `tokens` |
| `field.color.focus-border` | `--fsds-field-color-focus-border` | ✓ consumed | `tokens` |
| `field.color.invalid-border` | `--fsds-field-color-invalid-border` | ✓ consumed | `tokens` |
| `field.color.invalid-text` | `--fsds-field-color-invalid-text` | ✓ consumed | `tokens` |
| `field.color.valid-border` | `--fsds-field-color-valid-border` | ✓ consumed | `tokens` |
| `field.color.validating-border` | `--fsds-field-color-validating-border` | ✗ dead | `tokens` |
| `field.color.validating-text` | `--fsds-field-color-validating-text` | ✗ dead | `tokens` |
| `field.color.valid-text` | `--fsds-field-color-valid-text` | ✗ dead | `tokens` |
| `field.spacing.indicator` | `--fsds-field-spacing-indicator` | ✗ dead | `tokens` |
| `field.label.fontSize` | `--fsds-field-label-fontSize` | ✓ consumed | `tokens` |
| `field.label.color` | `--fsds-field-label-color` | ✓ consumed | `tokens` |
| `field.focus.ring.width` | `--fsds-field-focus-ring-width` | ✓ consumed | `tokens` |
| `field.focus.ring.color` | `--fsds-field-focus-ring-color` | ✓ consumed | `tokens` |
| `field.focus.ring.style` | `--fsds-field-focus-ring-style` | ✓ consumed | `tokens` |
| `field.focus.ring.offset` | `--fsds-field-focus-ring-offset` | ✓ consumed | `tokens` |

### Icon  `.icon`

declared: **5** · consumed: **5** · dead: **0**

### Image  `.image`

declared: **15** · consumed: **13** · dead: **2**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `image.color.background.default` | `--fsds-image-color-background-default` | ✓ consumed | `tokens` |
| `image.color.foreground.primary` | `--fsds-image-color-foreground-primary` | ✓ consumed | `tokens` |
| `image.size.icon` | `--fsds-image-size-icon` | ✗ dead | `tokens` |
| `image.typography.error.fontSize` | `--fsds-image-typography-error-fontSize` | ✗ dead | `tokens` |
| `image.size.xs` | `--fsds-image-size-xs` | ✓ consumed | `tokens` |
| `image.size.sm` | `--fsds-image-size-sm` | ✓ consumed | `tokens` |
| `image.size.md` | `--fsds-image-size-md` | ✓ consumed | `tokens` |
| `image.size.lg` | `--fsds-image-size-lg` | ✓ consumed | `tokens` |
| `image.size.xl` | `--fsds-image-size-xl` | ✓ consumed | `tokens` |
| `image.radius.none` | `--fsds-image-radius-none` | ✓ consumed | `tokens` |
| `image.radius.sm` | `--fsds-image-radius-sm` | ✓ consumed | `tokens` |
| `image.radius.md` | `--fsds-image-radius-md` | ✓ consumed | `tokens` |
| `image.radius.lg` | `--fsds-image-radius-lg` | ✓ consumed | `tokens` |
| `image.radius.full` | `--fsds-image-radius-full` | ✓ consumed | `tokens` |

### Input  `.input`

declared: **31** · consumed: **29** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `box-model.min-height` | `--fsds-box-model-min-height` | ✗ dead | `tokens` |
| `input.color.bg.default` | `--fsds-input-color-bg-default` | ✓ consumed | `tokens` |
| `input.color.bg.disabled` | `--fsds-input-color-bg-disabled` | ✓ consumed | `tokens` |
| `input.color.text.default` | `--fsds-input-color-text-default` | ✓ consumed | `tokens` |
| `input.color.text.placeholder` | `--fsds-input-color-text-placeholder` | ✓ consumed | `tokens` |
| `input.color.text.disabled` | `--fsds-input-color-text-disabled` | ✓ consumed | `tokens` |
| `input.color.border.default` | `--fsds-input-color-border-default` | ✓ consumed | `tokens` |
| `input.color.border.hover` | `--fsds-input-color-border-hover` | ✓ consumed | `tokens` |
| `input.color.border.disabled` | `--fsds-input-color-border-disabled` | ✓ consumed | `tokens` |
| `input.size.height.default` | `--fsds-input-size-height-default` | ✓ consumed | `tokens` |
| `input.size.padding-block.default` | `--fsds-input-size-padding-block-default` | ✓ consumed | `tokens` |
| `input.size.padding-inline.default` | `--fsds-input-size-padding-inline-default` | ✓ consumed | `tokens` |
| `input.size.radius.default` | `--fsds-input-size-radius-default` | ✓ consumed | `tokens` |
| `input.size.border.default` | `--fsds-input-size-border-default` | ✓ consumed | `tokens` |
| `input.space.inline.default` | `--fsds-input-space-inline-default` | ✗ dead | `tokens` |
| `input.color.focus.default` | `--fsds-input-color-focus-default` | ✓ consumed | `tokens` |
| `input.color.invalid.default` | `--fsds-input-color-invalid-default` | ✓ consumed | `tokens` |
| `input.typography.size.default` | `--fsds-input-typography-size-default` | ✓ consumed | `tokens` |
| `input.typography.line-height.default` | `--fsds-input-typography-line-height-default` | ✓ consumed | `tokens` |
| `input.opacity.disabled` | `--fsds-input-opacity-disabled` | ✓ consumed | `tokens` |
| `input.focus.ring.width` | `--fsds-input-focus-ring-width` | ✓ consumed | `tokens` |
| `input.focus.ring.color` | `--fsds-input-focus-ring-color` | ✓ consumed | `tokens` |
| `input.focus.ring.style` | `--fsds-input-focus-ring-style` | ✓ consumed | `tokens` |
| `input.focus.ring.offset` | `--fsds-input-focus-ring-offset` | ✓ consumed | `tokens` |
| `input.motion.duration.fast` | `--fsds-input-motion-duration-fast` | ✓ consumed | `tokens` |
| `input.motion.easing.standard` | `--fsds-input-motion-easing-standard` | ✓ consumed | `tokens` |

### Label  `.label`

declared: **4** · consumed: **3** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `label.color.text.default` | `--fsds-label-color-text-default` | ✓ consumed | `tokens` |
| `label.typo.weight.default` | `--fsds-label-typo-weight-default` | ✗ dead | `tokens` |
| `label.typo.lineHeight.default` | `--fsds-label-typo-lineHeight-default` | ✓ consumed | `tokens` |

### Links  `.links`

declared: **16** · consumed: **13** · dead: **2**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `links.color.foreground.default` | `--fsds-links-color-foreground-default` | ✓ consumed | `tokens` |
| `links.color.foreground.hover` | `--fsds-links-color-foreground-hover` | ✓ consumed | `tokens` |
| `links.color.foreground.visited` | `--fsds-links-color-foreground-visited` | ✓ consumed | `tokens` |
| `links.color.foreground.disabled` | `--fsds-links-color-foreground-disabled` | ✓ consumed | `tokens` |
| `links.color.underline.default` | `--fsds-links-color-underline-default` | ✓ consumed | `tokens` |
| `links.spacing.gap.default` | `--fsds-links-spacing-gap-default` | ✓ consumed | `tokens` |
| `links.motion.duration.fast` | `--fsds-links-motion-duration-fast` | ✓ consumed | `tokens` |
| `links.focus.ring.width` | `--fsds-links-focus-ring-width` | ✓ consumed | `tokens` |
| `links.focus.ring.color` | `--fsds-links-focus-ring-color` | ✓ consumed | `tokens` |
| `links.focus.ring.style` | `--fsds-links-focus-ring-style` | ✓ consumed | `tokens` |
| `links.focus.ring.offset` | `--fsds-links-focus-ring-offset` | ✓ consumed | `tokens` |
| `links.focus.ring.radius` | `--fsds-links-focus-ring-radius` | ✓ consumed | `tokens` |
| `links.size.fontSize.small` | `--fsds-links-size-fontSize-small` | ✗ dead | `tokens` |
| `links.size.fontSize.medium` | `--fsds-links-size-fontSize-medium` | ✓ consumed | `tokens` |
| `links.size.fontSize.large` | `--fsds-links-size-fontSize-large` | ✗ dead | `tokens` |

### List  `.list`

declared: **11** · consumed: **11** · dead: **0**

### NavList  `.nav-list`

declared: **17** · consumed: **10** · dead: **7**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `nav-list.color.foreground.default` | `--fsds-nav-list-color-foreground-default` | ✓ consumed | `tokens` |
| `nav-list.color.foreground.hover` | `--fsds-nav-list-color-foreground-hover` | ✓ consumed | `tokens` |
| `nav-list.color.foreground.current` | `--fsds-nav-list-color-foreground-current` | ✓ consumed | `tokens` |
| `nav-list.color.background.default` | `--fsds-nav-list-color-background-default` | ✗ dead | `tokens` |
| `nav-list.color.background.hover` | `--fsds-nav-list-color-background-hover` | ✗ dead | `tokens` |
| `nav-list.stateLayer.hover` | `--fsds-nav-list-stateLayer-hover` | ✓ consumed | `tokens` |
| `nav-list.stateLayer.selected` | `--fsds-nav-list-stateLayer-selected` | ✓ consumed | `tokens` |
| `nav-list.color.background.current` | `--fsds-nav-list-color-background-current` | ✗ dead | `tokens` |
| `nav-list.color.outline.focus` | `--fsds-nav-list-color-outline-focus` | ✗ dead | `tokens` |
| `nav-list.size.padding.block` | `--fsds-nav-list-size-padding-block` | ✓ consumed | `tokens` |
| `nav-list.size.padding.inline` | `--fsds-nav-list-size-padding-inline` | ✓ consumed | `tokens` |
| `nav-list.size.radius.default` | `--fsds-nav-list-size-radius-default` | ✓ consumed | `tokens` |
| `nav-list.size.gap.list` | `--fsds-nav-list-size-gap-list` | ✓ consumed | `tokens` |
| `nav-list.size.gap.group` | `--fsds-nav-list-size-gap-group` | ✗ dead | `tokens` |
| `nav-list.size.fontSize.item` | `--fsds-nav-list-size-fontSize-item` | ✗ dead | `tokens` |
| `nav-list.size.fontSize.groupLabel` | `--fsds-nav-list-size-fontSize-groupLabel` | ✗ dead | `tokens` |

### OTP  `.otp`

declared: **16** · consumed: **15** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `box-model.min-height` | `--fsds-box-model-min-height` | ✓ consumed | `tokens` |
| `otp.color.background.default` | `--fsds-otp-color-background-default` | ✓ consumed | `tokens` |
| `otp.color.foreground.primary` | `--fsds-otp-color-foreground-primary` | ✓ consumed | `tokens` |
| `otp.color.border.default` | `--fsds-otp-color-border-default` | ✓ consumed | `tokens` |
| `otp.size.padding.default` | `--fsds-otp-size-padding-default` | ✗ dead | `tokens` |
| `otp.size.radius.default` | `--fsds-otp-size-radius-default` | ✓ consumed | `tokens` |
| `otp.color.border.accent` | `--fsds-otp-color-border-accent` | ✓ consumed | `tokens` |
| `otp.focus.ring.width` | `--fsds-otp-focus-ring-width` | ✓ consumed | `tokens` |
| `otp.focus.ring.color` | `--fsds-otp-focus-ring-color` | ✓ consumed | `tokens` |
| `otp.focus.ring.style` | `--fsds-otp-focus-ring-style` | ✓ consumed | `tokens` |
| `otp.focus.ring.offset` | `--fsds-otp-focus-ring-offset` | ✓ consumed | `tokens` |

### Popover  `.popover`

declared: **13** · consumed: **12** · dead: **0**

### Postcard  `.postcard`

declared: **22** · consumed: **20** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `box-model.min-width` | `--fsds-box-model-min-width` | ✓ consumed | `tokens` |
| `postcard.color.background.default` | `--fsds-postcard-color-background-default` | ✓ consumed | `tokens` |
| `postcard.color.background.hover` | `--fsds-postcard-color-background-hover` | ✓ consumed | `tokens` |
| `postcard.color.border.default` | `--fsds-postcard-color-border-default` | ✓ consumed | `tokens` |
| `postcard.color.border.hover` | `--fsds-postcard-color-border-hover` | ✓ consumed | `tokens` |
| `postcard.color.foreground.primary` | `--fsds-postcard-color-foreground-primary` | ✓ consumed | `tokens` |
| `postcard.size.padding.default` | `--fsds-postcard-size-padding-default` | ✓ consumed | `tokens` |
| `postcard.size.radius.default` | `--fsds-postcard-size-radius-default` | ✓ consumed | `tokens` |
| `postcard.size.radius.full` | `--fsds-postcard-size-radius-full` | ✗ dead | `tokens` |
| `postcard.size.gap.default` | `--fsds-postcard-size-gap-default` | ✓ consumed | `tokens` |
| `postcard.size.border.default` | `--fsds-postcard-size-border-default` | ✓ consumed | `tokens` |
| `postcard.typography.displayName.fontSize` | `--fsds-postcard-typography-displayName-fontSize` | ✓ consumed | `tokens` |
| `postcard.typography.displayName.fontWeight` | `--fsds-postcard-typography-displayName-fontWeight` | ✓ consumed | `tokens` |
| `postcard.typography.handle.fontSize` | `--fsds-postcard-typography-handle-fontSize` | ✓ consumed | `tokens` |
| `postcard.typography.content.fontSize` | `--fsds-postcard-typography-content-fontSize` | ✓ consumed | `tokens` |
| `postcard.typography.content.lineHeight` | `--fsds-postcard-typography-content-lineHeight` | ✓ consumed | `tokens` |
| `postcard.typography.footer.fontSize` | `--fsds-postcard-typography-footer-fontSize` | ✓ consumed | `tokens` |

### ProfileFlag  `.profile-flag`

declared: **8** · consumed: **7** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `profile-flag.color.background.default` | `--fsds-profile-flag-color-background-default` | ✓ consumed | `tokens` |
| `profile-flag.color.border.default` | `--fsds-profile-flag-color-border-default` | ✓ consumed | `tokens` |
| `profile-flag.color.foreground.primary` | `--fsds-profile-flag-color-foreground-primary` | ✓ consumed | `tokens` |
| `profile-flag.size.radius.default` | `--fsds-profile-flag-size-radius-default` | ✓ consumed | `tokens` |
| `profile-flag.spacing.gap.default` | `--fsds-profile-flag-spacing-gap-default` | ✓ consumed | `tokens` |
| `profile-flag.spacing.padding.default` | `--fsds-profile-flag-spacing-padding-default` | ✗ dead | `tokens` |
| `profile-flag.spacing.padding.right` | `--fsds-profile-flag-spacing-padding-right` | ✓ consumed | `tokens` |
| `profile-flag.color.border.hover` | `--fsds-profile-flag-color-border-hover` | ✓ consumed | `tokens` |

### Progress  `.progress`

declared: **8** · consumed: **8** · dead: **0**

### Select  `.select`

declared: **24** · consumed: **22** · dead: **2**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `box-model.min-height` | `--fsds-box-model-min-height` | ✓ consumed | `tokens` |
| `select.color.background.default` | `--fsds-select-color-background-default` | ✓ consumed | `tokens` |
| `select.color.foreground.default` | `--fsds-select-color-foreground-default` | ✓ consumed | `tokens` |
| `select.color.border.default` | `--fsds-select-color-border-default` | ✓ consumed | `tokens` |
| `select.color.icon.default` | `--fsds-select-color-icon-default` | ✗ dead | `tokens` |
| `select.color.placeholder.default` | `--fsds-select-color-placeholder-default` | ✓ consumed | `tokens` |
| `select.size.padding.default` | `--fsds-select-size-padding-default` | ✓ consumed | `tokens` |
| `select.size.radius.default` | `--fsds-select-size-radius-default` | ✓ consumed | `tokens` |
| `select.size.border.default` | `--fsds-select-size-border-default` | ✓ consumed | `tokens` |
| `select.size.sm.height` | `--fsds-select-size-sm-height` | ✓ consumed | `tokens` |
| `select.size.md.height` | `--fsds-select-size-md-height` | ✓ consumed | `tokens` |
| `select.size.lg.height` | `--fsds-select-size-lg-height` | ✓ consumed | `tokens` |
| `select.font.size.default` | `--fsds-select-font-size-default` | ✓ consumed | `tokens` |
| `select.font.lineHeight.default` | `--fsds-select-font-lineHeight-default` | ✓ consumed | `tokens` |
| `select.color.icon.isOpen` | `--fsds-select-color-icon-isOpen` | ✗ dead | `tokens` |
| `select.focus.ring.width` | `--fsds-select-focus-ring-width` | ✓ consumed | `tokens` |
| `select.focus.ring.color` | `--fsds-select-focus-ring-color` | ✓ consumed | `tokens` |
| `select.focus.ring.style` | `--fsds-select-focus-ring-style` | ✓ consumed | `tokens` |
| `select.focus.ring.offset` | `--fsds-select-focus-ring-offset` | ✓ consumed | `tokens` |

### Sheet  `.sheet`

declared: **26** · consumed: **23** · dead: **3**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `box-model.min-width` | `--fsds-box-model-min-width` | ✓ consumed | `tokens` |
| `sheet.color.overlay` | `--fsds-sheet-color-overlay` | ✓ consumed | `tokens` |
| `sheet.color.background` | `--fsds-sheet-color-background` | ✓ consumed | `tokens` |
| `sheet.color.border` | `--fsds-sheet-color-border` | ✓ consumed | `tokens` |
| `sheet.color.text` | `--fsds-sheet-color-text` | ✓ consumed | `tokens` |
| `sheet.color.textTitle` | `--fsds-sheet-color-textTitle` | ✓ consumed | `tokens` |
| `sheet.color.textDescription` | `--fsds-sheet-color-textDescription` | ✓ consumed | `tokens` |
| `sheet.border.width` | `--fsds-sheet-border-width` | ✓ consumed | `tokens` |
| `sheet.border.radius` | `--fsds-sheet-border-radius` | ✓ consumed | `tokens` |
| `sheet.size.width` | `--fsds-sheet-size-width` | ✓ consumed | `tokens` |
| `sheet.size.height` | `--fsds-sheet-size-height` | ✓ consumed | `tokens` |
| `sheet.size.close` | `--fsds-sheet-size-close` | ✓ consumed | `tokens` |
| `sheet.spacing.padding` | `--fsds-sheet-spacing-padding` | ✓ consumed | `tokens` |
| `sheet.spacing.gap` | `--fsds-sheet-spacing-gap` | ✓ consumed | `tokens` |
| `sheet.text.size` | `--fsds-sheet-text-size` | ✓ consumed | `tokens` |
| `sheet.text.sizeTitle` | `--fsds-sheet-text-sizeTitle` | ✓ consumed | `tokens` |
| `sheet.text.weightTitle` | `--fsds-sheet-text-weightTitle` | ✓ consumed | `tokens` |
| `sheet.shadow` | `--fsds-sheet-shadow` | ✓ consumed | `tokens` |
| `sheet.focus.width` | `--fsds-sheet-focus-width` | ✗ dead | `tokens` |
| `sheet.focus.color` | `--fsds-sheet-focus-color` | ✗ dead | `tokens` |
| `sheet.color.backgroundHover` | `--fsds-sheet-color-backgroundHover` | ✗ dead | `tokens` |

### ShowMore  `.show-more`

declared: **15** · consumed: **12** · dead: **3**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `box-model.min-height` | `--fsds-box-model-min-height` | ✓ consumed | `tokens` |
| `box-model.min-width` | `--fsds-box-model-min-width` | ✓ consumed | `tokens` |
| `show-more.color.background.default` | `--fsds-show-more-color-background-default` | ✓ consumed | `tokens` |
| `show-more.color.foreground.primary` | `--fsds-show-more-color-foreground-primary` | ✓ consumed | `tokens` |
| `show-more.color.foreground.secondary` | `--fsds-show-more-color-foreground-secondary` | ✓ consumed | `tokens` |
| `show-more.color.border.default` | `--fsds-show-more-color-border-default` | ✗ dead | `tokens` |
| `show-more.color.border.accent` | `--fsds-show-more-color-border-accent` | ✗ dead | `tokens` |
| `show-more.size.padding.default` | `--fsds-show-more-size-padding-default` | ✓ consumed | `tokens` |
| `show-more.size.radius.default` | `--fsds-show-more-size-radius-default` | ✓ consumed | `tokens` |
| `show-more.overlay.imageOverlay` | `--fsds-show-more-overlay-imageOverlay` | ✗ dead | `tokens` |

### Shuttle  `.shuttle`

declared: **7** · consumed: **6** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `shuttle.color.background.default` | `--fsds-shuttle-color-background-default` | ✓ consumed | `tokens` |
| `shuttle.color.foreground.primary` | `--fsds-shuttle-color-foreground-primary` | ✓ consumed | `tokens` |
| `shuttle.color.border.default` | `--fsds-shuttle-color-border-default` | ✗ dead | `tokens` |
| `shuttle.color.border.accent` | `--fsds-shuttle-color-border-accent` | ✓ consumed | `tokens` |
| `shuttle.size.padding.default` | `--fsds-shuttle-size-padding-default` | ✓ consumed | `tokens` |
| `shuttle.size.radius.default` | `--fsds-shuttle-size-radius-default` | ✓ consumed | `tokens` |

### Skeleton  `.skeleton`

declared: **13** · consumed: **7** · dead: **6**

| slot | CSS var | status | source |
|---|---|---|---|
| `skeleton.color.base` | `--fsds-skeleton-color-base` | ✓ consumed | `tokens` |
| `skeleton.color.highlight` | `--fsds-skeleton-color-highlight` | ✓ consumed | `tokens` |
| `skeleton.color.static` | `--fsds-skeleton-color-static` | ✗ dead | `tokens` |
| `skeleton.radius.sm` | `--fsds-skeleton-radius-sm` | ✗ dead | `tokens` |
| `skeleton.radius.md` | `--fsds-skeleton-radius-md` | ✓ consumed | `tokens` |
| `skeleton.radius.lg` | `--fsds-skeleton-radius-lg` | ✗ dead | `tokens` |
| `skeleton.radius.full` | `--fsds-skeleton-radius-full` | ✗ dead | `tokens` |
| `skeleton.gap.compact` | `--fsds-skeleton-gap-compact` | ✗ dead | `tokens` |
| `skeleton.gap.md` | `--fsds-skeleton-gap-md` | ✓ consumed | `tokens` |
| `skeleton.gap.spacious` | `--fsds-skeleton-gap-spacious` | ✗ dead | `tokens` |
| `skeleton.anim.duration` | `--fsds-skeleton-anim-duration` | ✓ consumed | `tokens` |
| `skeleton.anim.easing` | `--fsds-skeleton-anim-easing` | ✓ consumed | `tokens` |
| `skeleton.shape.height.text` | `--fsds-skeleton-shape-height-text` | ✓ consumed | `tokens` |

### Spinner  `.spinner`

declared: **10** · consumed: **10** · dead: **0**

### Stat  `.stat`

declared: **14** · consumed: **10** · dead: **4**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `stat.color.foreground.value` | `--fsds-stat-color-foreground-value` | ✓ consumed | `tokens` |
| `stat.color.foreground.label` | `--fsds-stat-color-foreground-label` | ✗ dead | `tokens` |
| `stat.color.foreground.trend.up` | `--fsds-stat-color-foreground-trend-up` | ✓ consumed | `tokens` |
| `stat.color.foreground.trend.down` | `--fsds-stat-color-foreground-trend-down` | ✓ consumed | `tokens` |
| `stat.color.foreground.trend.neutral` | `--fsds-stat-color-foreground-trend-neutral` | ✓ consumed | `tokens` |
| `stat.size.value.sm` | `--fsds-stat-size-value-sm` | ✓ consumed | `tokens` |
| `stat.size.value.md` | `--fsds-stat-size-value-md` | ✓ consumed | `tokens` |
| `stat.size.value.lg` | `--fsds-stat-size-value-lg` | ✓ consumed | `tokens` |
| `stat.size.label` | `--fsds-stat-size-label` | ✗ dead | `tokens` |
| `stat.size.gap` | `--fsds-stat-size-gap` | ✗ dead | `tokens` |
| `stat.typography.lineHeight.value` | `--fsds-stat-typography-lineHeight-value` | ✓ consumed | `tokens` |
| `stat.typography.weight.value` | `--fsds-stat-typography-weight-value` | ✓ consumed | `tokens` |
| `stat.typography.weight.label` | `--fsds-stat-typography-weight-label` | ✗ dead | `tokens` |

### Status  `.status`

declared: **14** · consumed: **14** · dead: **0**

### Switch  `.switch`

declared: **38** · consumed: **38** · dead: **0**

### Table  `.table`

declared: **22** · consumed: **16** · dead: **6**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `table.color.text` | `--fsds-table-color-text` | ✓ consumed | `tokens` |
| `table.color.textMuted` | `--fsds-table-color-textMuted` | ✗ dead | `tokens` |
| `table.color.border` | `--fsds-table-color-border` | ✓ consumed | `tokens` |
| `table.color.background.footer` | `--fsds-table-color-background-footer` | ✓ consumed | `tokens` |
| `table.border.width` | `--fsds-table-border-width` | ✓ consumed | `tokens` |
| `table.spacing.cellX` | `--fsds-table-spacing-cellX` | ✓ consumed | `tokens` |
| `table.spacing.cellY` | `--fsds-table-spacing-cellY` | ✓ consumed | `tokens` |
| `table.spacing.caption` | `--fsds-table-spacing-caption` | ✓ consumed | `tokens` |
| `table.spacing.sortGap` | `--fsds-table-spacing-sortGap` | ✗ dead | `tokens` |
| `table.size.cellHeight` | `--fsds-table-size-cellHeight` | ✗ dead | `tokens` |
| `table.size.radius` | `--fsds-table-size-radius` | ✓ consumed | `tokens` |
| `table.text.size` | `--fsds-table-text-size` | ✓ consumed | `tokens` |
| `table.text.lineHeight` | `--fsds-table-text-lineHeight` | ✓ consumed | `tokens` |
| `table.text.sizeCaption` | `--fsds-table-text-sizeCaption` | ✓ consumed | `tokens` |
| `table.text.weightHead` | `--fsds-table-text-weightHead` | ✓ consumed | `tokens` |
| `table.text.weightFooter` | `--fsds-table-text-weightFooter` | ✓ consumed | `tokens` |
| `table.color.background.hover` | `--fsds-table-color-background-hover` | ✓ consumed | `tokens` |
| `table.color.background.selected` | `--fsds-table-color-background-selected` | ✓ consumed | `tokens` |
| `table.focus.width` | `--fsds-table-focus-width` | ✗ dead | `tokens` |
| `table.focus.color` | `--fsds-table-focus-color` | ✗ dead | `tokens` |
| `table.focus.offset` | `--fsds-table-focus-offset` | ✗ dead | `tokens` |

### Tabs  `.tabs`

declared: **18** · consumed: **15** · dead: **2**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `tabs.spacing.gap` | `--fsds-tabs-spacing-gap` | ✓ consumed | `tokens` |
| `tabs.spacing.padding` | `--fsds-tabs-spacing-padding` | ✓ consumed | `tokens` |
| `tabs.spacing.pillPadding` | `--fsds-tabs-spacing-pillPadding` | ✓ consumed | `tokens` |
| `tabs.spacing.panelGap` | `--fsds-tabs-spacing-panelGap` | ✓ consumed | `tokens` |
| `tabs.color.fg` | `--fsds-tabs-color-fg` | ✓ consumed | `tokens` |
| `tabs.color.disabled-fg` | `--fsds-tabs-color-disabled-fg` | ✓ consumed | `tokens` |
| `tabs.color.indicator` | `--fsds-tabs-color-indicator` | ✓ consumed | `tokens` |
| `tabs.shape.radius` | `--fsds-tabs-shape-radius` | ✓ consumed | `tokens` |
| `tabs.motion.indicator` | `--fsds-tabs-motion-indicator` | ✓ consumed | `tokens` |
| `tabs.color.hover.bg` | `--fsds-tabs-color-hover-bg` | ✓ consumed | `tokens` |
| `tabs.color.hover.fg` | `--fsds-tabs-color-hover-fg` | ✓ consumed | `tokens` |
| `tabs.color.active-fg` | `--fsds-tabs-color-active-fg` | ✓ consumed | `tokens` |
| `tabs.color.active-bg` | `--fsds-tabs-color-active-bg` | ✓ consumed | `tokens` |
| `tabs.color.focus` | `--fsds-tabs-color-focus` | ✗ dead | `tokens` |
| `tabs.color.underline.active` | `--fsds-tabs-color-underline-active` | ✓ consumed | `tokens` |
| `tabs.size.indicator.thickness` | `--fsds-tabs-size-indicator-thickness` | ✓ consumed | `tokens` |
| `tabs.size.vertical.listWidth` | `--fsds-tabs-size-vertical-listWidth` | ✗ dead | `tokens` |

### Text  `.text`

declared: **18** · consumed: **12** · dead: **6**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `text.color.foreground.primary` | `--fsds-text-color-foreground-primary` | ✓ consumed | `tokens` |
| `text.typography.fontWeight.light` | `--fsds-text-typography-fontWeight-light` | ✓ consumed | `tokens` |
| `text.typography.fontWeight.regular` | `--fsds-text-typography-fontWeight-regular` | ✓ consumed | `tokens` |
| `text.typography.fontWeight.medium` | `--fsds-text-typography-fontWeight-medium` | ✓ consumed | `tokens` |
| `text.typography.fontWeight.bold` | `--fsds-text-typography-fontWeight-bold` | ✓ consumed | `tokens` |
| `text.typography.lineHeight.heading` | `--fsds-text-typography-lineHeight-heading` | ✓ consumed | `tokens` |
| `text.typography.lineHeight.body` | `--fsds-text-typography-lineHeight-body` | ✓ consumed | `tokens` |
| `text.typography.lineHeight.tight` | `--fsds-text-typography-lineHeight-tight` | ✓ consumed | `tokens` |
| `text.typography.letterSpacing.wide` | `--fsds-text-typography-letterSpacing-wide` | ✓ consumed | `tokens` |
| `text.typography.letterSpacing.tight` | `--fsds-text-typography-letterSpacing-tight` | ✓ consumed | `tokens` |
| `text.size.xs` | `--fsds-text-size-xs` | ✗ dead | `tokens` |
| `text.size.sm` | `--fsds-text-size-sm` | ✗ dead | `tokens` |
| `text.size.md` | `--fsds-text-size-md` | ✓ consumed | `tokens` |
| `text.size.lg` | `--fsds-text-size-lg` | ✗ dead | `tokens` |
| `text.size.xl` | `--fsds-text-size-xl` | ✗ dead | `tokens` |
| `text.size.2xl` | `--fsds-text-size-2xl` | ✗ dead | `tokens` |
| `text.size.3xl` | `--fsds-text-size-3xl` | ✗ dead | `tokens` |

### TextField  `.text-field`

declared: **37** · consumed: **36** · dead: **0**

### Toast  `.toast`

declared: **21** · consumed: **14** · dead: **6**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `box-model.min-width` | `--fsds-box-model-min-width` | ✓ consumed | `tokens` |
| `toast.surface.bg` | `--fsds-toast-surface-bg` | ✓ consumed | `tokens` |
| `toast.surface.border` | `--fsds-toast-surface-border` | ✓ consumed | `tokens` |
| `toast.surface.radius` | `--fsds-toast-surface-radius` | ✓ consumed | `tokens` |
| `toast.surface.shadow` | `--fsds-toast-surface-shadow` | ✓ consumed | `tokens` |
| `toast.color.default` | `--fsds-toast-color-default` | ✓ consumed | `tokens` |
| `toast.accent.default` | `--fsds-toast-accent-default` | ✗ dead | `tokens` |
| `toast.color.intent.bg` | `--fsds-toast-color-intent-bg` | ✗ dead | `tokens` |
| `toast.color.intent.border` | `--fsds-toast-color-intent-border` | ✗ dead | `tokens` |
| `toast.spacing.padding` | `--fsds-toast-spacing-padding` | ✓ consumed | `tokens` |
| `toast.spacing.gap` | `--fsds-toast-spacing-gap` | ✓ consumed | `tokens` |
| `toast.spacing.stackGap` | `--fsds-toast-spacing-stackGap` | ✓ consumed | `tokens` |
| `toast.size.maxWidth` | `--fsds-toast-size-maxWidth` | ✓ consumed | `tokens` |
| `toast.motion.enter` | `--fsds-toast-motion-enter` | ✗ dead | `tokens` |
| `toast.motion.leave` | `--fsds-toast-motion-leave` | ✗ dead | `tokens` |
| `toast.timing.auto-dismiss` | `--fsds-toast-timing-auto-dismiss` | ✗ dead | `tokens` |

### ToggleSwitch  `.toggle-switch`

declared: **19** · consumed: **19** · dead: **0**

### Tooltip  `.tooltip`

declared: **15** · consumed: **14** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.padding-block-start` | `--fsds-box-model-padding-block-start` | ✓ consumed | `tokens` |
| `box-model.padding-block-end` | `--fsds-box-model-padding-block-end` | ✓ consumed | `tokens` |
| `box-model.padding-inline-start` | `--fsds-box-model-padding-inline-start` | ✓ consumed | `tokens` |
| `box-model.padding-inline-end` | `--fsds-box-model-padding-inline-end` | ✓ consumed | `tokens` |
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `box-model.min-width` | `--fsds-box-model-min-width` | ✓ consumed | `tokens` |
| `tooltip.color.background.default` | `--fsds-tooltip-color-background-default` | ✓ consumed | `tokens` |
| `tooltip.color.foreground.default` | `--fsds-tooltip-color-foreground-default` | ✓ consumed | `tokens` |
| `tooltip.color.border.default` | `--fsds-tooltip-color-border-default` | ✓ consumed | `tokens` |
| `tooltip.size.padding.y` | `--fsds-tooltip-size-padding-y` | ✗ dead | `tokens` |
| `tooltip.size.padding.x` | `--fsds-tooltip-size-padding-x` | ✓ consumed | `tokens` |
| `tooltip.size.radius.default` | `--fsds-tooltip-size-radius-default` | ✓ consumed | `tokens` |
| `tooltip.size.maxWidth` | `--fsds-tooltip-size-maxWidth` | ✓ consumed | `tokens` |
| `tooltip.typography.fontSize` | `--fsds-tooltip-typography-fontSize` | ✓ consumed | `tokens` |
| `tooltip.layer.content` | `--fsds-tooltip-layer-content` | ✓ consumed | `tokens` |

### Truncate  `.truncate`

declared: **6** · consumed: **4** · dead: **2**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✓ consumed | `tokens` |
| `truncate.color.foreground.link` | `--fsds-truncate-color-foreground-link` | ✓ consumed | `tokens` |
| `truncate.color.background.primary` | `--fsds-truncate-color-background-primary` | ✗ dead | `tokens` |
| `truncate.typography.fontWeight` | `--fsds-truncate-typography-fontWeight` | ✓ consumed | `tokens` |
| `truncate.spacing.toggle` | `--fsds-truncate-spacing-toggle` | ✓ consumed | `tokens` |
| `truncate.color.foreground.linkHover` | `--fsds-truncate-color-foreground-linkHover` | ✗ dead | `tokens` |

### Walkthrough  `.walkthrough`

declared: **24** · consumed: **22** · dead: **1**

| slot | CSS var | status | source |
|---|---|---|---|
| `box-model.gap` | `--fsds-box-model-gap` | ✗ dead | `tokens` |
| `walkthrough.surface.bg` | `--fsds-walkthrough-surface-bg` | ✓ consumed | `tokens` |
| `walkthrough.surface.border` | `--fsds-walkthrough-surface-border` | ✓ consumed | `tokens` |
| `walkthrough.surface.radius` | `--fsds-walkthrough-surface-radius` | ✓ consumed | `tokens` |
| `walkthrough.surface.shadow` | `--fsds-walkthrough-surface-shadow` | ✓ consumed | `tokens` |
| `walkthrough.surface.padding` | `--fsds-walkthrough-surface-padding` | ✓ consumed | `tokens` |
| `walkthrough.title.fontSize` | `--fsds-walkthrough-title-fontSize` | ✓ consumed | `tokens` |
| `walkthrough.title.fontWeight` | `--fsds-walkthrough-title-fontWeight` | ✓ consumed | `tokens` |
| `walkthrough.title.color` | `--fsds-walkthrough-title-color` | ✓ consumed | `tokens` |
| `walkthrough.description.fontSize` | `--fsds-walkthrough-description-fontSize` | ✓ consumed | `tokens` |
| `walkthrough.description.color` | `--fsds-walkthrough-description-color` | ✓ consumed | `tokens` |
| `walkthrough.description.marginTop` | `--fsds-walkthrough-description-marginTop` | ✓ consumed | `tokens` |
| `walkthrough.controls.gap` | `--fsds-walkthrough-controls-gap` | ✓ consumed | `tokens` |
| `walkthrough.controls.marginTop` | `--fsds-walkthrough-controls-marginTop` | ✓ consumed | `tokens` |
| `walkthrough.dots.size` | `--fsds-walkthrough-dots-size` | ✓ consumed | `tokens` |
| `walkthrough.dots.gap` | `--fsds-walkthrough-dots-gap` | ✓ consumed | `tokens` |
| `walkthrough.dots.active` | `--fsds-walkthrough-dots-active` | ✗ dead | `tokens` |
| `walkthrough.dots.idle` | `--fsds-walkthrough-dots-idle` | ✓ consumed | `tokens` |
| `walkthrough.button.primary.bg` | `--fsds-walkthrough-button-primary-bg` | ✓ consumed | `tokens` |
| `walkthrough.button.primary.color` | `--fsds-walkthrough-button-primary-color` | ✓ consumed | `tokens` |
| `walkthrough.button.primary.radius` | `--fsds-walkthrough-button-primary-radius` | ✓ consumed | `tokens` |
| `walkthrough.button.secondary.bg` | `--fsds-walkthrough-button-secondary-bg` | ✓ consumed | `tokens` |
| `walkthrough.button.secondary.color` | `--fsds-walkthrough-button-secondary-color` | ✓ consumed | `tokens` |
| `walkthrough.button.secondary.border` | `--fsds-walkthrough-button-secondary-border` | ✓ consumed | `tokens` |

