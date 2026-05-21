// Internal re-export uses an explicit .ts extension because Vite's TS-aware
// config loader (esbuild under the hood) doesn't resolve cross-.ts imports
// without one when this module is pulled in via vite.config.ts's dep graph.
// allowImportingTsExtensions is set in the root tsconfig.json to satisfy tsc.
export { compileAngularPackage, angularPackageRoot } from "./compile.ts";
export type {
  CompileOptions,
  CompileResult,
  CompileDiagnostic,
} from "./compile.ts";
