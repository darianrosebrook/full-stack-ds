// Tiny CORS server that serves the live-run bundle so chrome-devtools can fetch
// it into the Figma tab (avoids embedding 10KB in an evaluate_script call).
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const PORT = 8765;
createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/javascript");
  if (req.url === "/ping") {
    res.end("pong");
    return;
  }
  try {
    res.end(readFileSync("/tmp/fsds-live-inject.js", "utf8"));
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e));
  }
}).listen(PORT, "127.0.0.1", () => console.log(`serving live-inject on http://127.0.0.1:${PORT}`));
