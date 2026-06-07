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
    "React Native admission is opt-in and is not part of the default five-web-framework governed rail.",
    "Runtime evidence is limited to generated React Native render tests for the admitted primitive/form slice; it does not prove simulator or device execution, native visual parity, or platform accessibility parity.",
    "Surface behavior and compound-part parity remain unadmitted for React Native.",
  ],
};
