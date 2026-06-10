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
    "Runtime evidence is limited to generated React Native render tests (host-render archetypes + variant style realization); it does not prove simulator or device execution, native visual parity, or platform accessibility parity.",
    "Surface behavior (Dialog/Sheet/Popover/Toast need a native Modal/BackHandler substrate) and compound-part emission (Tabs/Accordion subcomponents) remain unadmitted for React Native.",
    "Part-scoped variant styling, boolean-modifier styling (e.g. Card --inset), and interactive state styling (pressed/disabled) are not yet realized natively.",
  ],
};
