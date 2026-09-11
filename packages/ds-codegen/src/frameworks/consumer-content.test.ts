import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateSwiftUIComponentSource } from "./swift/swiftui/component-source.js";
import { generateJetpackComposeComponentSource } from "./jetpack-compose/component-source.js";
import { generateReactNativeComponentSource } from "./react-native/component-source.js";

it("keeps a renamed annotated-source contract's literal fallback in native realizations", () => {
  const contract = JSON.parse(readFileSync(resolve(__dirname, "../../../ds-contracts/components/CodeBlock/CodeBlock.contract.json"), "utf8")) as ComponentContract;
  contract.name = "AnnotatedSource";
  const ir = buildComponentIR(contract);
  const swift = generateSwiftUIComponentSource(ir);
  expect(swift).toContain("public struct AnnotatedSource<Content: View>");
  expect(swift).toContain("extension AnnotatedSource where Content == SwiftUI.Text");
  expect(swift).toContain('code: String = ""');
  expect(swift).toContain("SwiftUI.Text(verbatim: code)");
  expect(swift).toContain(".font(.system(.body, design: .monospaced))");
  const compose = generateJetpackComposeComponentSource(ir);
  expect(compose).toContain("code: String");
  expect(compose).toContain("content: (@Composable () -> Unit)? = null");
  expect(compose).toContain("text = code");
  expect(compose).toContain("if (content != null)");
  const native = JSON.stringify(generateReactNativeComponentSource(ir));
  expect(native).toContain("styles.source");
  expect(native.match(/styles\.root/g)).toHaveLength(1);
});
