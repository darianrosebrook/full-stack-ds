import type { Plugin } from "vite";

import { gitDocsSource, projectDocs } from "./projection";

/**
 * The docs-data plugin: ONE projection module wired into both transports.
 *
 * - dev (`configureServer`): /docs-data/* middleware recomputes payloads from
 *   the working tree on every request — save a doc, refresh, see it. No
 *   restart, no rebuild, nothing to forget.
 * - build (`generateBundle`): emits the same payloads as static assets under
 *   docs-data/, from the same code path, so the packaged site cannot diverge
 *   from the dev site (Sterling's port needed a second .mjs renderer copy for
 *   its prerender; there is nothing to duplicate here).
 *
 * Failure posture is fail-closed: a projection error surfaces as a 500 JSON
 * body in dev and a thrown build error in production, never an empty site.
 */

const PAGE_ID_PATTERN = /^\/pages\/([a-f0-9]{16})\.json$/;

function jsonAsset(fileName: string, payload: unknown) {
  return {
    type: "asset" as const,
    fileName,
    source: `${JSON.stringify(payload)}\n`,
  };
}

export function docsDataPlugin(): Plugin {
  let repoRoot = process.cwd();

  return {
    name: "fsds-docs-data",
    enforce: "pre",
    configResolved(config) {
      repoRoot = config.root;
    },
    configureServer(server) {
      server.middlewares.use("/docs-data", (req, res, _next) => {
        const url = (req.url ?? "").split("?", 1)[0];
        const send = (status: number, payload: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(`${JSON.stringify(payload)}\n`);
        };
        try {
          const projection = projectDocs(gitDocsSource(repoRoot));
          if (url === "/index.json" || url === "/") {
            send(200, projection.index);
            return;
          }
          if (url === "/docs-graph.json") {
            send(200, projection.graph);
            return;
          }
          const pageMatch = PAGE_ID_PATTERN.exec(url);
          if (pageMatch) {
            const page = projection.pages.get(pageMatch[1]);
            if (page === undefined) {
              send(404, { error: `unknown docs page ${pageMatch[1]}` });
              return;
            }
            send(200, page);
            return;
          }
          send(404, { error: `unknown docs-data route ${url}` });
        } catch (error) {
          send(500, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });
    },
    generateBundle() {
      const projection = projectDocs(gitDocsSource(repoRoot));
      this.emitFile(jsonAsset("docs-data/index.json", projection.index));
      this.emitFile(jsonAsset("docs-data/docs-graph.json", projection.graph));
      for (const page of projection.pages.values()) {
        this.emitFile(jsonAsset(`docs-data/pages/${page.id}.json`, page));
      }
    },
  };
}
