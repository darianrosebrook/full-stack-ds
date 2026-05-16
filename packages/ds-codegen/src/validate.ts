/**
 * Ajv-based validation for component and primitive contracts.
 *
 * The codegen pipeline always validates *before* building IR or emitting.
 * Returning typed result objects (rather than throwing) lets the CLI report
 * every invalid contract in one pass and keep generating the valid subset
 * when the caller chooses to.
 */
import fs from "node:fs";
import path from "node:path";
import { Ajv, type ValidateFunction } from "ajv";
import type { ComponentContract } from "./contract.js";

export interface ValidationIssue {
  /** JSON-pointer path of the failing field, or "/" for root-level errors. */
  pointer: string;
  message: string;
}

export interface ValidationFailure {
  ok: false;
  issues: ValidationIssue[];
}

export interface ValidationSuccess<T> {
  ok: true;
  value: T;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export interface ContractValidator {
  validateComponent(contract: unknown): ValidationResult<ComponentContract>;
  validatePrimitive(primitive: unknown): ValidationResult<unknown>;
}

export interface ContractValidatorPaths {
  contractsRoot: string;
  componentSchemaPath?: string;
  primitiveSchemaPath?: string;
}

const DEFAULT_COMPONENT_SCHEMA = "component.contract.schema.json";
const DEFAULT_PRIMITIVE_SCHEMA = path.join(
  "primitives",
  "primitive.contract.schema.json",
);

/**
 * Build a validator that loads schemas from a contracts root directory.
 * Throws if either schema file is missing — codegen cannot run safely
 * against an unknown schema.
 */
export function createContractValidator(
  paths: ContractValidatorPaths,
): ContractValidator {
  const componentSchemaPath = path.resolve(
    paths.contractsRoot,
    paths.componentSchemaPath ?? DEFAULT_COMPONENT_SCHEMA,
  );
  const primitiveSchemaPath = path.resolve(
    paths.contractsRoot,
    paths.primitiveSchemaPath ?? DEFAULT_PRIMITIVE_SCHEMA,
  );

  for (const p of [componentSchemaPath, primitiveSchemaPath]) {
    if (!fs.existsSync(p)) {
      throw new Error(`Schema file not found: ${p}`);
    }
  }

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validateComponentFn = ajv.compile(
    JSON.parse(fs.readFileSync(componentSchemaPath, "utf-8")),
  );
  const validatePrimitiveFn = ajv.compile(
    JSON.parse(fs.readFileSync(primitiveSchemaPath, "utf-8")),
  );

  return {
    validateComponent(contract) {
      return runValidation<ComponentContract>(validateComponentFn, contract);
    },
    validatePrimitive(primitive) {
      return runValidation<unknown>(validatePrimitiveFn, primitive);
    },
  };
}

function runValidation<T>(
  fn: ValidateFunction,
  data: unknown,
): ValidationResult<T> {
  if (fn(data)) {
    return { ok: true, value: data as T };
  }
  return {
    ok: false,
    issues: (fn.errors || []).map((err) => ({
      pointer: err.instancePath || "/",
      message: err.message ?? "validation failed",
    })),
  };
}

/**
 * Format issues for human-readable CLI output. Stable, two-space indented.
 */
export function formatIssues(issues: ValidationIssue[]): string {
  return issues.map((i) => `  ${i.pointer}: ${i.message}`).join("\n");
}
