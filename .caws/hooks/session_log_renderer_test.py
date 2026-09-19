"""Acceptance fixtures for the session-log publication order.

Every failure fixture starts with a PRE-EXISTING turn-001.json, because that is
the evidence the old order destroyed. A fixture that begins empty cannot tell a
non-destructive writer from a destructive one -- which is exactly the mistake the
earlier probe made.
"""
import importlib.util, json, shutil, sys, tempfile
from pathlib import Path

RENDERER = Path(__file__).with_name("session_log_renderer.py")
spec = importlib.util.spec_from_file_location("slr", RENDERER)
slr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(slr)

PRIOR = {"turn": 1, "marker": "PREVIOUS GENERATION"}
results = []

def fixture(name):
    d = Path(tempfile.mkdtemp(prefix=f"fixture-{name}-"))
    (d / "turn-001.json").write_text(json.dumps(PRIOR), encoding="utf-8")
    return d

def run(log_dir, transcript, cwd="/tmp"):
    return slr.render_session(
        log_dir=str(log_dir), cwd=cwd, session_id="s", started_at="t", model="m",
        branch="b", head_sha="h", dirty_count="0", start_sha="h", transcript_path=str(transcript),
    )

def check(name, log_dir, code, expect_prior, expect_marker, expect_turns=None):
    files = sorted(p.name for p in log_dir.iterdir())
    turns = [f for f in files if f.startswith("turn-")]
    prior_kept = json.loads((log_dir / "turn-001.json").read_text()) == PRIOR if "turn-001.json" in files else False
    marker = (log_dir / ".render-failed.json").exists()
    ok = (prior_kept == expect_prior) and (marker == expect_marker) and (code != 0) == (expect_marker)
    if expect_turns is not None:
        ok = ok and len(turns) == expect_turns
    results.append((name, ok, f"exit={code} turns={turns} prior_kept={prior_kept} marker={marker}"))

# 1. missing input, with a prior generation on disk
d = fixture("missing")
code = run(d, Path("/nonexistent/transcript.jsonl"))
check("missing-input-retains-prior", d, code, True, True)

# 2. injected parser exception
d = fixture("parse")
real_parse = slr.parse_transcript_events
slr.parse_transcript_events = lambda _p: (_ for _ in ()).throw(RuntimeError("injected parser failure"))
tf = d / "t.jsonl"; tf.write_text("{}", encoding="utf-8")
code = run(d, tf)
slr.parse_transcript_events = real_parse
check("parse-failure-retains-prior", d, code, True, True)

# The fixtures below must REACH publish_generation, or they test the zero-turn
# branch while claiming to test the swap. One turn is supplied explicitly.
real_accumulate, real_build = slr.accumulate_turns, slr.build_turn_payload
def one_turn():
    slr.accumulate_turns = lambda _events, _cwd: ([{"id": 1}], [])
    slr.build_turn_payload = lambda _turn, n: {"turn": n, "generation": "new"}

# 3. injected write failure during the swap -- with a real replacement staged
d = fixture("write")
one_turn()
real_replace = slr.os.replace
slr.os.replace = lambda *a, **k: (_ for _ in ()).throw(OSError("injected write failure"))
code = run(d, tf)
slr.os.replace = real_replace
slr.accumulate_turns, slr.build_turn_payload = real_accumulate, real_build
check("write-failure-retains-prior", d, code, True, True)

# 4. successful replacement actually WRITES a new generation
d = fixture("success")
one_turn()
code = run(d, tf)
slr.accumulate_turns, slr.build_turn_payload = real_accumulate, real_build
new_turn = json.loads((d / "turn-001.json").read_text()) if (d / "turn-001.json").exists() else {}
results.append(("success-replaces-and-clears-marker",
                code == 0 and new_turn.get("generation") == "new" and not (d / ".render-failed.json").exists(),
                f"exit={code} turn-001={new_turn}"))

# 5. parsed, but zero substantive turns -- an explicit policy, not a failure
d = fixture("empty")
slr.parse_transcript_events = lambda _p: []
code = run(d, tf)
slr.parse_transcript_events = real_parse
files = sorted(p.name for p in d.iterdir())
results.append(("parsed-empty-retires-prior-deliberately",
                code == 0 and "turn-001.json" not in files and not (d / ".render-failed.json").exists(),
                f"exit={code} files={files}"))

# 7. a failure part-way through the swap must leave A generation, not an empty dir
d = fixture("partial")
slr.accumulate_turns = lambda _events, _cwd: ([{"id": 1}, {"id": 2}], [])
slr.build_turn_payload = lambda _turn, n: {"turn": n, "generation": "new"}
real_replace = slr.os.replace
calls = {"n": 0}
def flaky(src, dst, *a, **k):
    calls["n"] += 1
    if calls["n"] > 1:
        raise OSError("injected swap failure after the first replacement")
    return real_replace(src, dst, *a, **k)
slr.os.replace = flaky
code = run(d, tf)
slr.os.replace = real_replace
slr.accumulate_turns, slr.build_turn_payload = real_accumulate, real_build
files = sorted(p.name for p in d.iterdir())
turns = [f for f in files if f.startswith("turn-")]
ok = code == 1 and len(turns) == 1 and (d / ".render-failed.json").exists()
results.append(("partial-swap-never-empties-the-directory", ok, f"exit={code} turns={turns}"))

# 6. no prior generation and no transcript: nothing to protect, not a failure
d = Path(tempfile.mkdtemp(prefix="fixture-noprior-"))
code = run(d, Path("/nonexistent/transcript.jsonl"))
results.append(("no-prior-and-no-transcript-is-not-a-failure", code == 0, f"exit={code}"))

for name, ok, detail in results:
    print(f"{'PASS' if ok else 'FAIL'}  {name}  --  {detail}")
sys.exit(0 if all(ok for _, ok, _ in results) else 1)
