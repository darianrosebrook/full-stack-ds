// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./CodeBlock.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CodeBlockLanguage = "bash" | "css" | "html" | "javascript" | "json" | "jsx" | "markdown" | "plaintext" | "tsx" | "typescript";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface CodeBlockProps {
  code: string;
  language: CodeBlockLanguage;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function CodeBlock({
  className,
  "data-testid": testId,
  code,
  language,
  ...rest
}: CodeBlockProps) {
  const classNames = [
    "code-block",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <Stack layout="native" as="pre" className={`${classNames}`} data-language={language} data-testid={testId} {...rest}>
    <code className="code-block__code" spellCheck="false" data-language={language}>
      {code}
    </code>
  </Stack>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
