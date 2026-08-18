# Native token-realization matrix

`FEAT-TOKEN-REALIZATION-AUDIT-001` — read-only scoreboard. Contract-declared token slots (from `<Name>.tokens.json` sidecars) vs what each native target realizes through its per-component carrier. This is the measurement the mobile parity matrix could only mark "unmeasured".

| target | admitted (with slots) | carrier present | slots realized / declared | admission | carrier | slot | orphan |
|---|---|---|---|---|---|---|---|
| react-native | 50 | 50 | 898 / 898 | 0 | 0 | 0 | 0 |
| swiftui | 49 | 49 | 732 / 895 | 1 | 0 | 163 | 0 |
| jetpack-compose | 2 | 2 | 57 / 57 | 48 | 0 | 0 | 0 |

Gap kinds: `admission` = corpus component not in an explicit-only target's allowlist · `carrier` = admitted but no per-component token carrier · `slot` = carrier missing declared slots · `orphan` = carrier without declared slots.
