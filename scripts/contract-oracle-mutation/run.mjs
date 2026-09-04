#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import {
  CONTRACT_MUTANTS,
  applyContractMutation,
  changedLeaves,
  summarizeMutationResults,
} from "./catalog.mjs";

const STAGES = Object.freeze({
  "generate-check": {
    command: ["pnpm", "run", "generate:check"],
    evidenceClass: "structural",
  },
  "generate-all": {
    command: ["pnpm", "run", "generate", "--", "--target=all"],
    evidenceClass: "structural",
  },
  admission: {
    command: [
      "node",
      "packages/ds-codegen/dist/validation/validate-cli.js",
      "--require-artifact-manifest",
    ],
    evidenceClass: "structural",
  },
  "typecheck-all": {
    command: ["pnpm", "run", "typecheck:all"],
    evidenceClass: "structural",
  },
  "audit-behavior": {
    command: ["pnpm", "run", "audit:behavior-realization"],
    evidenceClass: "contract-derived",
  },
  "audit-a11y": {
    command: ["pnpm", "run", "audit:a11y-realization"],
    evidenceClass: "contract-derived",
  },
  "audit-dead-slots": {
    command: ["pnpm", "run", "audit:dead-slots"],
    evidenceClass: "contract-derived",
  },
  "audit-pseudo-state": {
    command: ["pnpm", "run", "audit:pseudo-state"],
    evidenceClass: "contract-derived",
  },
  "audit-state-suppression": {
    command: ["pnpm", "run", "audit:state-suppression"],
    evidenceClass: "contract-derived",
  },
  "audit-token-resolvability": {
    command: ["pnpm", "run", "audit:token-resolvability"],
    evidenceClass: "contract-derived",
  },
  "audit-custom-regions": {
    command: ["pnpm", "run", "audit:custom-regions"],
    evidenceClass: "contract-derived",
  },
  "audit-motion": {
    command: ["pnpm", "run", "audit:motion-realization"],
    evidenceClass: "contract-derived",
  },
  "audit-carrier-reachability": {
    command: ["pnpm", "run", "audit:carrier-reachability"],
    evidenceClass: "contract-derived",
  },
  "audit-variant-realization": {
    command: ["pnpm", "run", "audit:variant-realization"],
    evidenceClass: "contract-derived",
  },
  "root-tests": {
    command: ["pnpm", "test"],
    evidenceClass: "mixed-test",
  },
  "framework-tests": {
    command: ["pnpm", "run", "test:frameworks"],
    evidenceClass: "mixed-test",
  },
  "runtime-fact-rail": {
    command: ["pnpm", "run", "e2e:rail"],
    evidenceClass: "hand-authored-runtime",
  },
  "render-binding-rail": {
    command: ["pnpm", "run", "e2e:render-binding"],
    evidenceClass: "hand-authored-runtime",
  },
});

const PROFILES = Object.freeze({
  core: [
    "generate-check",
    "generate-all",
    "admission",
    "audit-a11y",
    "root-tests",
    "framework-tests",
  ],
  full: Object.keys(STAGES),
});

function usage() {
  console.log([
    "Usage: node scripts/contract-oracle-mutation/run.mjs [options]",
    "",
    "  --profile=full|core          Gate profile (default: full)",
    "  --only=id[,id...]            Run only selected catalog mutants",
    "  --max-survivors=N            Exit 1 when survivors exceed N",
    "  --stage-timeout-minutes=N    Per-stage timeout (default: 20)",
    "  --offline                    Install the sandbox from the pnpm store only",
    "  --keep-sandbox               Retain the throwaway clone",
    "  --list                       Print the catalog and exit",
    "  --help                       Print this help",
  ].join("\n"));
}

function parseArgs(argv) {
  const options = {
    profile: "full",
    only: null,
    maxSurvivors: null,
    stageTimeoutMinutes: 20,
    offline: false,
    keepSandbox: false,
    list: false,
  };

  for (const arg of argv) {
    if (arg === "--") {
      continue;
    } else if (arg === "--help") {
      usage();
      process.exit(0);
    } else if (arg === "--list") {
      options.list = true;
    } else if (arg === "--offline") {
      options.offline = true;
    } else if (arg === "--keep-sandbox") {
      options.keepSandbox = true;
    } else if (arg.startsWith("--profile=")) {
      options.profile = arg.slice("--profile=".length);
    } else if (arg.startsWith("--only=")) {
      options.only = new Set(
        arg
          .slice("--only=".length)
          .split(",")
          .filter(Boolean),
      );
    } else if (arg.startsWith("--max-survivors=")) {
      options.maxSurvivors = Number(arg.slice("--max-survivors=".length));
    } else if (arg.startsWith("--stage-timeout-minutes=")) {
      options.stageTimeoutMinutes = Number(
        arg.slice("--stage-timeout-minutes=".length),
      );
    } else {
      throw new Error("Unknown argument: " + arg);
    }
  }

  if (!(options.profile in PROFILES)) {
    throw new Error("Unknown profile: " + options.profile);
  }
  if (
    options.maxSurvivors !== null &&
    (!Number.isInteger(options.maxSurvivors) || options.maxSurvivors < 0)
  ) {
    throw new Error("--max-survivors must be a non-negative integer");
  }
  if (
    !Number.isFinite(options.stageTimeoutMinutes) ||
    options.stageTimeoutMinutes <= 0
  ) {
    throw new Error("--stage-timeout-minutes must be positive");
  }
  return options;
}

function capture(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0" },
  });
  if (result.status !== 0) {
    throw new Error(
      command +
        " " +
        args.join(" ") +
        " failed:\n" +
        (result.stderr || result.stdout || "no output"),
    );
  }
  return result.stdout.trim();
}

async function runCommand({
  id,
  command,
  cwd,
  logPath,
  timeoutMinutes,
  env,
}) {
  mkdirSync(dirname(logPath), { recursive: true });
  const startedAt = Date.now();
  console.log(
    "[mutation][start] " + id + " :: " + command.map(shellDisplay).join(" "),
  );

  return await new Promise((resolvePromise) => {
    const child = spawn(command[0], command.slice(1), {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    let timedOut = false;

    const append = (chunk) => {
      output += chunk.toString();
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);

    const heartbeat = setInterval(() => {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      console.log("[mutation][wait] " + id + " still running (+" + seconds + "s)");
    }, 30000);
    const timeout = setTimeout(
      () => {
        timedOut = true;
        child.kill("SIGTERM");
      },
      timeoutMinutes * 60 * 1000,
    );

    child.on("error", (error) => {
      output += "\nspawn error: " + error.stack + "\n";
    });
    child.on("close", (code, signal) => {
      clearInterval(heartbeat);
      clearTimeout(timeout);
      writeFileSync(logPath, output);
      const durationMs = Date.now() - startedAt;
      const result = {
        id,
        command,
        code,
        signal,
        timedOut,
        durationMs,
        logPath,
      };
      console.log(
        "[mutation][" +
          (code === 0 ? "pass" : "red") +
          "] " +
          id +
          " (" +
          formatDuration(durationMs) +
          ")",
      );
      resolvePromise(result);
    });
  });
}

function shellDisplay(value) {
  return /^[A-Za-z0-9_./:=@+-]+$/.test(value)
    ? value
    : JSON.stringify(value);
}

function formatDuration(durationMs) {
  return (durationMs / 1000).toFixed(1) + "s";
}

function safeRemoveSandbox(path) {
  const expectedParent = resolve(tmpdir());
  if (
    resolve(dirname(path)) !== expectedParent ||
    !basename(path).startsWith("fsds-contract-oracle-")
  ) {
    throw new Error("Refusing to remove unexpected sandbox path: " + path);
  }
  rmSync(path, { recursive: true, force: true });
}

function trackedDiff(repo) {
  const result = spawnSync("git", ["diff", "--no-ext-diff", "--exit-code"], {
    cwd: repo,
    encoding: "utf8",
  });
  return { clean: result.status === 0, output: result.stdout + result.stderr };
}

function renderMarkdown(report, reportDir) {
  const lines = [
    "# Contract oracle mutation report",
    "",
    "- Commit: " + report.commit,
    "- Profile: " + report.profile,
    "- Started: " + report.startedAt,
    "- Finished: " + report.finishedAt,
    "- Baseline: " + (report.baseline.passed ? "passed" : "failed"),
    "- Detected: " + report.summary.detected + "/" + report.summary.total,
    "- Survived: " + report.summary.survived + "/" + report.summary.total,
    "",
    "Detection means a selected gate went red. It does not by itself prove an",
    "independent correctness oracle: structural and contract-derived detectors",
    "are reported separately, and mixed-test stages contain generated tests,",
    "axe, and hand-authored custom regions. A survivor means no selected stage",
    "contradicted the mutation; it does not prove the original fact is correct.",
    "",
    "## Results",
    "",
    "| Mutant | Field class | Outcome | First detector | Evidence class |",
    "|---|---|---|---|---|",
  ];

  for (const result of report.results) {
    const detection = result.firstDetection;
    lines.push(
      "| " +
        result.id +
        " | " +
        result.fieldClass +
        " | " +
        result.outcome +
        " | " +
        (detection?.stage ?? "none") +
        " | " +
        (detection?.evidenceClass ?? "none") +
        " |",
    );
  }

  lines.push("", "## Field classes", "");
  lines.push("| Field class | Total | Detected | Survived |");
  lines.push("|---|---:|---:|---:|");
  for (const [fieldClass, counts] of Object.entries(
    report.summary.byFieldClass,
  )) {
    lines.push(
      "| " +
        fieldClass +
        " | " +
        counts.total +
        " | " +
        counts.detected +
        " | " +
        counts.survived +
        " |",
    );
  }

  lines.push("", "## Reproduction", "");
  lines.push(
    "Run: pnpm run audit:contract-oracle-mutations -- --profile=" +
      report.profile,
  );
  lines.push(
    "Machine-readable details and per-stage logs are adjacent to this file in " +
      relative(process.cwd(), reportDir) +
      ".",
  );
  return lines.join("\n") + "\n";
}

function writeReport(report, reportDir) {
  report.finishedAt = new Date().toISOString();
  report.summary = summarizeMutationResults(report.results);
  writeFileSync(
    join(reportDir, "report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  writeFileSync(join(reportDir, "report.md"), renderMarkdown(report, reportDir));
}

async function runStages({
  label,
  stageIds,
  sandboxRepo,
  reportDir,
  timeoutMinutes,
  env,
}) {
  const results = [];
  for (const stageId of stageIds) {
    const stage = STAGES[stageId];
    const result = await runCommand({
      id: label + ":" + stageId,
      command: stage.command,
      cwd: sandboxRepo,
      logPath: join(reportDir, "logs", label, stageId + ".log"),
      timeoutMinutes,
      env,
    });
    results.push({
      ...result,
      stage: stageId,
      evidenceClass: stage.evidenceClass,
      logPath: relative(reportDir, result.logPath),
    });
    if (result.code !== 0) break;
  }
  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.list) {
    for (const mutant of CONTRACT_MUTANTS) {
      console.log(
        mutant.id + "\t" + mutant.fieldClass + "\t" + mutant.hypothesis,
      );
    }
    return;
  }

  const repoRoot = capture("git", ["rev-parse", "--show-toplevel"], process.cwd());
  const commit = capture("git", ["rev-parse", "HEAD"], repoRoot);
  const status = capture(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=normal"],
    repoRoot,
  );
  if (status !== "") {
    throw new Error(
      "The source worktree must be clean so the report binds to one commit:\n" +
        status,
    );
  }

  let mutants = [...CONTRACT_MUTANTS];
  if (options.only) {
    const known = new Set(CONTRACT_MUTANTS.map((mutant) => mutant.id));
    const unknown = [...options.only].filter((id) => !known.has(id));
    if (unknown.length > 0) {
      throw new Error("Unknown mutant id(s): " + unknown.join(", "));
    }
    mutants = mutants.filter((mutant) => options.only.has(mutant.id));
  }
  if (mutants.length === 0) throw new Error("No mutants selected");

  const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const reportDir = join(
    repoRoot,
    "tmp",
    "contract-oracle-mutation",
    commit.slice(0, 12) + "-" + stamp,
  );
  mkdirSync(reportDir, { recursive: true });

  const sandboxRoot = mkdtempSync(join(tmpdir(), "fsds-contract-oracle-"));
  const sandboxRepo = join(sandboxRoot, "repo");
  const env = {
    ...process.env,
    CI: "true",
    FORCE_COLOR: "0",
  };
  const report = {
    schemaVersion: 1,
    commit,
    profile: options.profile,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    stageIds: PROFILES[options.profile],
    selectedMutants: mutants.map((mutant) => mutant.id),
    baseline: { passed: false, stages: [] },
    results: [],
    summary: summarizeMutationResults([]),
  };

  console.log("[mutation] report: " + join(reportDir, "report.md"));
  console.log("[mutation] sandbox: " + sandboxRepo);

  try {
    const installArgs = ["install", "--frozen-lockfile", "--prefer-offline"];
    if (options.offline) installArgs.push("--offline");

    const setupCommands = [
      {
        id: "clone",
        command: ["git", "clone", "--quiet", "--shared", "--no-checkout", repoRoot, sandboxRepo],
        cwd: repoRoot,
      },
      {
        id: "checkout",
        command: ["git", "checkout", "--quiet", "--detach", commit],
        cwd: sandboxRepo,
      },
      {
        id: "install",
        command: ["pnpm", ...installArgs],
        cwd: sandboxRepo,
      },
      {
        id: "tokens-build",
        command: ["pnpm", "run", "tokens:build"],
        cwd: sandboxRepo,
      },
    ];

    for (const setup of setupCommands) {
      const result = await runCommand({
        ...setup,
        logPath: join(reportDir, "logs", "setup", setup.id + ".log"),
        timeoutMinutes: options.stageTimeoutMinutes,
        env,
      });
      if (result.code !== 0) {
        report.baseline.failure = {
          stage: "setup:" + setup.id,
          logPath: relative(reportDir, result.logPath),
        };
        writeReport(report, reportDir);
        process.exitCode = 2;
        return;
      }
    }

    report.baseline.stages = await runStages({
      label: "baseline",
      stageIds: PROFILES[options.profile],
      sandboxRepo,
      reportDir,
      timeoutMinutes: options.stageTimeoutMinutes,
      env,
    });
    report.baseline.passed =
      report.baseline.stages.length === PROFILES[options.profile].length &&
      report.baseline.stages.every((stage) => stage.code === 0);
    if (!report.baseline.passed) {
      writeReport(report, reportDir);
      console.error(
        "[mutation] baseline is red; no mutant can be credited with a detection",
      );
      process.exitCode = 2;
      return;
    }
    const baselineDiff = trackedDiff(sandboxRepo);
    if (!baselineDiff.clean) {
      writeFileSync(join(reportDir, "baseline-diff.patch"), baselineDiff.output);
      throw new Error(
        "Baseline stages changed tracked files; see baseline-diff.patch",
      );
    }

    for (const mutant of mutants) {
      console.log(
        "\n[mutation] " + mutant.id + " :: " + mutant.hypothesis,
      );
      const contractFile = join(sandboxRepo, mutant.contractPath);
      const originalText = readFileSync(contractFile, "utf8");
      const original = JSON.parse(originalText);
      const mutated = applyContractMutation(original, mutant);
      const changes = changedLeaves(original, mutated);
      if (changes.length !== 1) {
        throw new Error(
          "Mutant " + mutant.id + " changed " + changes.length + " leaves",
        );
      }
      writeFileSync(contractFile, JSON.stringify(mutated, null, 2) + "\n");

      const stages = await runStages({
        label: mutant.id,
        stageIds: PROFILES[options.profile],
        sandboxRepo,
        reportDir,
        timeoutMinutes: options.stageTimeoutMinutes,
        env,
      });
      const failed = stages.find((stage) => stage.code !== 0);
      const result = {
        id: mutant.id,
        fieldClass: mutant.fieldClass,
        contractPath: mutant.contractPath,
        pointer: mutant.pointer,
        from: mutant.from,
        to: mutant.to,
        hypothesis: mutant.hypothesis,
        outcome: failed ? "detected" : "survived",
        firstDetection: failed
          ? {
              stage: failed.stage,
              evidenceClass: failed.evidenceClass,
              code: failed.code,
              signal: failed.signal,
              timedOut: failed.timedOut,
              logPath: failed.logPath,
            }
          : null,
        stages,
      };
      report.results.push(result);
      writeReport(report, reportDir);

      writeFileSync(contractFile, originalText);
      const restore = await runCommand({
        id: mutant.id + ":restore-generation",
        command: ["pnpm", "run", "generate", "--", "--target=all"],
        cwd: sandboxRepo,
        logPath: join(
          reportDir,
          "logs",
          mutant.id,
          "restore-generation.log",
        ),
        timeoutMinutes: options.stageTimeoutMinutes,
        env,
      });
      if (restore.code !== 0) {
        throw new Error("Failed to restore generated output after " + mutant.id);
      }
      const restoredDiff = trackedDiff(sandboxRepo);
      if (!restoredDiff.clean) {
        const path = join(reportDir, mutant.id + "-restore-diff.patch");
        writeFileSync(path, restoredDiff.output);
        throw new Error(
          "Cross-mutant contamination after " + mutant.id + "; see " + path,
        );
      }
    }

    writeReport(report, reportDir);
    console.log(
      "\n[mutation] detected " +
        report.summary.detected +
        "/" +
        report.summary.total +
        "; survived " +
        report.summary.survived +
        "/" +
        report.summary.total,
    );
    console.log("[mutation] report: " + join(reportDir, "report.md"));

    if (
      options.maxSurvivors !== null &&
      report.summary.survived > options.maxSurvivors
    ) {
      console.error(
        "[mutation] survivor threshold exceeded: " +
          report.summary.survived +
          " > " +
          options.maxSurvivors,
      );
      process.exitCode = 1;
    }
  } finally {
    if (options.keepSandbox) {
      console.log("[mutation] retained sandbox: " + sandboxRepo);
    } else {
      safeRemoveSandbox(sandboxRoot);
    }
  }
}

main().catch((error) => {
  console.error("[mutation] FATAL: " + (error.stack ?? error));
  process.exitCode = 2;
});
