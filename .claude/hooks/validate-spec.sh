#!/bin/bash
# CAWS Spec Validation Hook for Claude Code
# Validates working-spec.yaml when it's edited
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

FILE_PATH="$HOOK_FILE_PATH"

emit_post_context() {
  local message="$1"
  MESSAGE="$message" python3 - <<'PY'
import json
import os

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": os.environ.get("MESSAGE", ""),
    }
}, indent=2))
PY
}

# Only validate CAWS YAML files
if [[ "$FILE_PATH" != *".caws/"* ]] || ([[ "$FILE_PATH" != *.yaml ]] && [[ "$FILE_PATH" != *.yml ]]); then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# First, validate YAML syntax using Node.js if available
if command -v node >/dev/null 2>&1; then
  if ! YAML_CHECK=$(node - "$FILE_PATH" <<'NODE' 2>&1
    try {
      const yaml = require('js-yaml');
      const fs = require('fs');
      const content = fs.readFileSync(process.argv[2], 'utf8');
      yaml.load(content);
      console.log('valid');
    } catch (error) {
      console.error(error.message);
      if (error.mark) {
        console.error('Line: ' + (error.mark.line + 1) + ', Column: ' + (error.mark.column + 1));
      }
      process.exit(1);
    }
NODE
  ); then
    emit_post_context "Spec validation failed for ${FILE_PATH}: YAML syntax error.

${YAML_CHECK}

Please fix the syntax before relying on this spec. Common issues: indentation, inconsistent arrays, or duplicate keys."
    exit 0
  fi
fi

# V2: Check test_nodeids coverage for terminal-status specs
# Specs at proven/complete/completed should have test_nodeids on every AC
if command -v node >/dev/null 2>&1; then
  if NODEIDS_CHECK=$(node - "$FILE_PATH" <<'NODE' 2>/dev/null
    const yaml = require('js-yaml');
    const fs = require('fs');
    const doc = yaml.load(fs.readFileSync(process.argv[2], 'utf8'));
    const status = (doc.status || '').toLowerCase();
    const terminal = ['proven', 'complete', 'completed'];
    if (!terminal.includes(status)) process.exit(0);
    const acs = doc.acceptance_criteria || doc.acceptance || [];
    const missing = acs
      .filter(ac => !ac.test_nodeids && !ac.evidence)
      .map(ac => ac.id);
    if (missing.length > 0) {
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext: 'Spec ' + doc.id + ' has status ' + JSON.stringify(status) +
            ' but these ACs lack test_nodeids or evidence: ' + missing.join(', ') +
            '. Terminal-status specs should have mechanical links to their proof tests. ' +
            'Add test_nodeids: [\"path/to/test.py::TestClass\"] to each AC, or evidence: for doc-only ACs.'
        }
      }));
    }
NODE
  ) && [[ -n "$NODEIDS_CHECK" ]]; then
    echo "$NODEIDS_CHECK"
  fi
fi

# Run CAWS CLI validation if available
if command -v caws &> /dev/null; then
  if VALIDATION=$(caws validate "$FILE_PATH" --quiet 2>&1); then
    :
  else
    # Get suggestions
    SUGGESTIONS=$(caws validate "$FILE_PATH" --suggestions 2>/dev/null | head -5 | tr '\n' ' ' || echo "Run 'caws validate --suggestions' for details")

    emit_post_context "Spec validation failed for ${FILE_PATH}:

${VALIDATION}

Suggestions:
${SUGGESTIONS}"
  fi
fi

exit 0
