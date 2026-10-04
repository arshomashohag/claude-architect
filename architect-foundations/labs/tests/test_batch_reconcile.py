"""Tests for Lab 4-4. Run from the labs folder: pytest tests/test_batch_reconcile.py"""
import copy

from batch_reconcile import reconcile


def ok(cid, text):
    return {"custom_id": cid, "result": {"type": "succeeded", "message": {"content": [{"type": "text", "text": text}]}}}


def err(cid, kind):
    return {"custom_id": cid, "result": {"type": "errored", "error": {"type": kind}}}


def other(cid, kind):
    return {"custom_id": cid, "result": {"type": kind}}


INPUTS = [{"custom_id": f"doc-0{i}", "params": {}} for i in range(1, 8)]
RESULTS = [  # shuffled, and doc-04 never came back
    err("doc-05", "invalid_request_error"),
    ok("doc-03", "C"),
    other("doc-02", "expired"),
    ok("doc-01", "A"),
    err("doc-06", "overloaded_error"),
    other("doc-07", "canceled"),
]


def run():
    return reconcile(copy.deepcopy(INPUTS), copy.deepcopy(RESULTS))


def test_matches_by_custom_id():
    """Matches results by custom_id, not position"""
    r = run()
    assert r["texts"].get("doc-01") == "A" and r["texts"].get("doc-03") == "C", f"texts = {r['texts']!r}"


def test_only_successes_in_texts():
    """Only succeeded results appear in texts"""
    keys = sorted(run()["texts"])
    assert keys == ["doc-01", "doc-03"], f"texts has keys {keys!r}"


def test_resubmits_retryable():
    """Resubmits expired, canceled and overloaded results"""
    s = run()["resubmit"]
    assert {"doc-02", "doc-06", "doc-07"} <= set(s), f"resubmit = {s!r}"


def test_resubmits_missing():
    """Resubmits inputs whose result never arrived"""
    s = run()["resubmit"]
    assert "doc-04" in s, f"doc-04 has no result and should be resubmitted; resubmit = {s!r}"


def test_invalid_requests_need_fix():
    """Sends invalid requests to needs_fix, not resubmit"""
    r = run()
    assert r["needs_fix"] == ["doc-05"] and "doc-05" not in r["resubmit"], f"needs_fix = {r['needs_fix']!r}"


def test_sorted_lists():
    """Returns sorted lists"""
    s = run()["resubmit"]
    assert s == ["doc-02", "doc-04", "doc-06", "doc-07"], f"resubmit = {s!r}"
