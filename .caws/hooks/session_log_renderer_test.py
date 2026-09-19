"""Acceptance fixtures for the session-log publication order.

Every failure fixture starts with a PRE-EXISTING turn-001.json, because that is
the evidence a destructive publication order destroys. A fixture that begins
empty cannot tell a non-destructive writer from a destructive one.

The property under test is unchanged: NO failure mode may destroy the previous
generation, and staleness must be OBSERVABLE. What changed is where the answer
is read from. The renderer publishes a receipt at .render-state.json carrying a
`status` and an `outputs_current` flag, so each case below asserts the exact
status string rather than the presence of a marker file -- a marker can only say
"something went wrong", while a status says which thing.

Two mechanism notes, recorded because both are easy to "fix" back by mistake:

  - Turn files are swapped with Path.replace, not os.replace. Injecting a write
    failure at os.replace no longer intercepts a turn write at all; it hits the
    receipt instead, so the fault under test would be the one the suite depends
    on to observe faults. Case 3 patches Path.replace deliberately.

  - parse_transcript_events takes a `cache` keyword. A stub that omits it raises
    TypeError at call time, which passes a "did it fail?" assertion for entirely
    the wrong reason.

Run: python3 .caws/hooks/session_log_renderer_test.py
Exit: 0 all properties hold, 1 otherwise.
"""
import importlib.util, json, sys, tempfile
from pathlib import Path

RENDERER = Path(__file__).with_name("session_log_renderer.py")
spec = importlib.util.spec_from_file_location("slr", RENDERER)
slr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(slr)

PRIOR = {"turn": 1, "marker": "PREVIOUS GENERATION"}
results = []


def fixture(name, with_prior=True):
    d = Path(tempfile.mkdtemp(prefix=f"fixture-{name}-"))
    if with_prior:
        (d / "turn-001.json").write_text(json.dumps(PRIOR), encoding="utf-8")
    return d


def run(log_dir, transcript, cwd="/tmp"):
    """Invoke the renderer; report whether it raised. Returns (raised, detail)."""
    try:
        slr.render_session(
            log_dir=str(log_dir), cwd=cwd, session_id="s", started_at="t", model="m",
            branch="b", head_sha="h", dirty_count="0", start_sha="h",
            transcript_path=str(transcript),
        )
        return False, "returned"
    except Exception as exc:
        return True, f"{type(exc).__name__}: {exc}"


def receipt(log_dir):
    path = log_dir / ".render-state.json"
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


def prior_intact(log_dir):
    path = log_dir / "turn-001.json"
    if not path.exists():
        return False
    return json.loads(path.read_text(encoding="utf-8")) == PRIOR


def turn_files(log_dir):
    return sorted(p.name for p in log_dir.iterdir() if p.name.startswith("turn-")
                  and p.name.endswith(".json"))


def check(name, ok, detail):
    results.append((name, bool(ok), detail))


def check_status(name, log_dir, expect_status, expect_current):
    """Assert the receipt's exact verdict, not merely that a receipt exists."""
    r = receipt(log_dir)
    if r is None:
        check(name, False, "no .render-state.json was published")
        return None
    ok = r["status"] == expect_status and r["outputs_current"] is expect_current
    check(name, ok,
          f"status={r['status']!r} (want {expect_status!r}) "
          f"outputs_current={r['outputs_current']} (want {expect_current})")
    return r


# v87's substantive-turn filter reads five keys off every turn. A stub that omits
# them raises KeyError before the write path is ever reached, which would make
# the write-failure cases below pass without exercising a write.
def fake_turn(i):
    return {"id": i, "user": f"u{i}", "timeline": [], "control_events": [],
            "interjections": [], "hook_contexts": []}


real_parse = slr.parse_transcript_events
real_accumulate = slr.accumulate_turns
real_build = slr.build_turn_payload
real_path_replace = Path.replace


def stage_turns(n):
    """Feed the renderer n substantive turns without a real transcript."""
    slr.parse_transcript_events = lambda _p, cache=None: [{"e": 1}]
    slr.accumulate_turns = lambda _e, _c: ([fake_turn(i) for i in range(n)], [])
    slr.build_turn_payload = lambda _t, idx, *a, **k: {"turn": idx, "generation": "new"}


def unstage():
    slr.parse_transcript_events = real_parse
    slr.accumulate_turns = real_accumulate
    slr.build_turn_payload = real_build
    Path.replace = real_path_replace


def transcript_in(d):
    tf = d / "t.jsonl"
    tf.write_text("{}", encoding="utf-8")
    return tf


# 1. Missing input, with a prior generation on disk. Not an error -- but the
#    turn files no longer reflect a readable transcript, so the receipt must not
#    certify them as current.
d = fixture("missing")
raised, detail = run(d, Path("/nonexistent/transcript.jsonl"))
check("missing-input-retains-prior", prior_intact(d) and not raised,
      f"raised={detail} prior_kept={prior_intact(d)}")
check_status("missing-input-is-not-certified-current", d,
             "retained_missing_transcript", False)

# 2. The parser raises. The prior generation must survive, the failure must stay
#    loud (re-raised, so the process exits non-zero), and the receipt must say so.
d = fixture("parse")
tf = transcript_in(d)
slr.parse_transcript_events = lambda _p, cache=None: (
    _ for _ in ()).throw(RuntimeError("injected parser failure"))
raised, detail = run(d, tf)
unstage()
check("parse-failure-retains-prior", prior_intact(d) and raised,
      f"raised={detail} prior_kept={prior_intact(d)}")
check_status("parse-failure-is-recorded", d, "failed", False)

# 3. A write failure during the swap, with a real replacement staged. Patches
#    Path.replace -- the seam turn files actually use -- leaving os.replace free
#    so the receipt can still be published and observed.
d = fixture("write")
tf = transcript_in(d)
stage_turns(1)


def boom(self, target):
    raise OSError("injected write failure")


Path.replace = boom
raised, detail = run(d, tf)
unstage()
check("write-failure-retains-prior", prior_intact(d) and raised,
      f"raised={detail} prior_kept={prior_intact(d)}")
check_status("write-failure-is-recorded", d, "failed", False)

# 4. A successful render actually REPLACES the generation. The inverse of every
#    case above: without this, a renderer that never writes anything would pass
#    the whole suite.
d = fixture("success")
tf = transcript_in(d)
stage_turns(1)
raised, detail = run(d, tf)
unstage()
new_turn = json.loads((d / "turn-001.json").read_text(encoding="utf-8"))
check("success-replaces-the-generation",
      not raised and new_turn.get("generation") == "new",
      f"raised={detail} turn-001={new_turn}")
check_status("success-is-certified-current", d, "rendered", True)

# 5. Parsed, but zero substantive turns, with a prior generation on disk.
#
#    POLICY REVERSAL, pinned deliberately in its current direction: an empty
#    projection RETAINS the prior generation rather than retiring it. An earlier
#    revision of this suite pinned the opposite -- an empty parse deleted the
#    prior turns as "an explicit policy, not a failure". That policy is a
#    data-loss mode: a transcript that becomes momentarily unparseable, or whose
#    projection empties for any transient reason, silently erased captured
#    history that nothing could reconstruct. Retention is not a silent success
#    either, which is why outputs_current is false: the turn files are real, but
#    they are OLD, and the receipt says which.
d = fixture("empty")
tf = transcript_in(d)
slr.parse_transcript_events = lambda _p, cache=None: []
raised, detail = run(d, tf)
unstage()
check("parsed-empty-retains-prior", prior_intact(d) and not raised,
      f"raised={detail} prior_kept={prior_intact(d)}")
check_status("parsed-empty-is-not-certified-current", d,
             "retained_empty_source", False)

# 6. A failure part-way through the swap must leave A generation, never an empty
#    directory. Two turns are staged and the SECOND replacement fails.
d = fixture("partial")
tf = transcript_in(d)
stage_turns(2)
calls = {"n": 0}


def flaky(self, target):
    calls["n"] += 1
    if calls["n"] > 1:
        raise OSError("injected swap failure after the first replacement")
    return real_path_replace(self, target)


Path.replace = flaky
raised, detail = run(d, tf)
unstage()
check("partial-swap-never-empties-the-directory",
      raised and len(turn_files(d)) >= 1,
      f"raised={detail} turns={turn_files(d)}")
check_status("partial-swap-is-recorded", d, "failed", False)

# 7. No prior generation and no transcript: nothing to protect. A genuinely
#    unused session is current at zero turns, not failed.
d = fixture("noprior", with_prior=False)
raised, detail = run(d, Path("/nonexistent/transcript.jsonl"))
check("no-prior-and-no-transcript-is-not-a-failure",
      not raised and turn_files(d) == [],
      f"raised={detail} turns={turn_files(d)}")
check_status("empty-session-is-certified-current", d, "empty", True)

# 8. THE LOAD-BEARING CASE. A receipt is only useful if a LATER failure
#    invalidates an EARLIER success. Render once successfully, then crash a
#    second render against a transcript that has since moved on. If the receipt
#    is written only on the success path, the stale one keeps certifying
#    outputs_current=true while the turn files are out of date and the render
#    that would have refreshed them died -- a renderer reporting success while
#    doing nothing, which is the worst failure shape available.
d = fixture("stale", with_prior=False)
tf = transcript_in(d)
stage_turns(1)
raised, first_detail = run(d, tf)
first = receipt(d)
unstage()
tf.write_text('{"new":"content"}\n', encoding="utf-8")
slr.parse_transcript_events = lambda _p, cache=None: (
    _ for _ in ()).throw(RuntimeError("injected failure on the second render"))
raised, detail = run(d, tf)
unstage()
after = receipt(d)
check("a-later-failure-invalidates-an-earlier-success",
      first is not None and first["status"] == "rendered"
      and first["outputs_current"] is True
      and raised and after is not None
      and after["status"] == "failed" and after["outputs_current"] is False,
      f"first={None if not first else (first['status'], first['outputs_current'])} "
      f"then={None if not after else (after['status'], after['outputs_current'])} "
      f"raised={detail}")

for name, ok, detail in results:
    print(f"{'PASS' if ok else 'FAIL'}  {name}  --  {detail}")
failed = [name for name, ok, _ in results if not ok]
print(f"\nsession-log publication order: "
      f"{'PASS' if not failed else 'FAIL'} ({len(results) - len(failed)}/{len(results)})")
sys.exit(0 if not failed else 1)
