import type { FrameworkValidationPlan } from "../types.js";

export const reactNativeValidationPlan: FrameworkValidationPlan = {
  framework: "react-native",
  commands: [
    {
      check: "typecheck",
      command: ["pnpm", "--filter", "@full-stack-ds/react-native", "run", "typecheck"],
      scope: {
        packageRoot: "packages/ds-react-native/",
        extensions: [".ts", ".tsx", ".json"],
        coverage: "covered_by_package_check",
      },
    },
    {
      check: "runtime",
      command: ["pnpm", "--filter", "@full-stack-ds/react-native", "run", "test"],
      scope: {
        packageRoot: "packages/ds-react-native/",
        extensions: [".ts", ".tsx"],
        coverage: "covered_by_package_check",
      },
    },
  ],
  checks: {
    typecheck: "direct",
    runtime: "direct",
    parse: "covered_by_typecheck",
  },
  knownGaps: [
    "Runtime evidence is limited to generated React Native render tests (host-render archetypes, variant style realization, surface substrate); it does not prove simulator or device execution, native visual parity, or platform accessibility parity.",
    "Non-anchored presence surfaces are admitted (Dialog/Sheet via Modal, Toast via live region); anchored kinds (Tooltip, Popover, coachmark/Walkthrough) need an anchor-measurement substrate and stay on the generic path. Compound-part emission (Tabs/Accordion subcomponents) remains unadmitted.",
    "Toast auto-dismiss timing is not implemented on any target (no duration prop exists); the surface contract honestly declares no timeout dismissal until web and RN implement it together.",
    "Part-scoped variant styling and boolean-modifier styling (e.g. Card --inset) are not yet realized natively.",
  ],
};
