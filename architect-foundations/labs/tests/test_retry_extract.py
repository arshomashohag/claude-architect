"""Tests for Lab 4-3. Run from the labs folder: pytest tests/test_retry_extract.py"""
import copy
import re

from retry_extract import extract_with_retry


class MockModel:
    """Returns outputs[n] on call n (repeating the last one) and records what it was sent."""

    def __init__(self, outputs):
        self.outputs = outputs
        self.calls = 0
        self.seen = []

    def __call__(self, messages):
        self.seen.append(copy.deepcopy(messages))
        self.calls += 1
        if self.calls > 6:
            raise RuntimeError("MOCK_BUDGET: called the model more than 6 times")
        return self.outputs[min(self.calls, len(self.outputs)) - 1]


def validate(obj):
    if "due_date" not in obj:
        return {"ok": False, "error": "due_date: missing", "retryable": True}
    if obj["due_date"] == "ABSENT":
        return {"ok": False, "error": "po_number: not present in document", "retryable": False}
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", obj["due_date"]):
        return {"ok": False, "error": "due_date: expected YYYY-MM-DD", "retryable": True}
    return {"ok": True}


GOOD = '{"due_date": "2024-06-30"}'
BAD = '{"due_date": "30/06/24"}'


def test_first_try():
    """Succeeds on the first try without extra calls"""
    m = MockModel([GOOD])
    r = extract_with_retry(m, "INV-1", validate)
    assert r["ok"] is True and r["attempts"] == 1 and m.calls == 1, f"Got {r!r} after {m.calls} call(s)."


def test_error_fed_back():
    """Feeds the specific error back, after the previous output"""
    m = MockModel([BAD, GOOD])
    r = extract_with_retry(m, "INV-2", validate)
    assert r["ok"] is True and r["attempts"] == 2, f"Expected ok after 2 attempts; got {r!r}"
    sent = m.seen[1]
    assert sent[-2]["role"] == "assistant" and sent[-2]["content"] == BAD, \
        "The second call should include the previous output as an assistant message."
    assert sent[-1]["role"] == "user" and "expected YYYY-MM-DD" in sent[-1]["content"], \
        "The last user message should quote the validation error."


def test_invalid_json_retried():
    """Treats unparseable output as a retryable failure"""
    m = MockModel(["Sure! Here is the JSON: {due_date: 2024-06-30}", GOOD])
    r = extract_with_retry(m, "INV-3", validate)
    assert r["ok"] is True and r["attempts"] == 2, f"Expected recovery on attempt 2; got {r!r}"
    assert "JSON" in m.seen[1][-1]["content"], "Tell the model its output was not valid JSON."


def test_gives_up_after_three():
    """Gives up after 3 attempts"""
    m = MockModel([BAD] * 5)
    r = extract_with_retry(m, "INV-4", validate)
    assert r["ok"] is False and r["attempts"] == 3 and m.calls == 3, f"Got {r!r} after {m.calls} call(s)."


def test_stops_when_info_absent():
    """Stops immediately when the information isn't in the document"""
    m = MockModel(['{"due_date": "ABSENT"}', GOOD])
    r = extract_with_retry(m, "INV-5", validate)
    assert r["ok"] is False and m.calls == 1, \
        f"Made {m.calls} call(s); retrying can't add information the source lacks."


def test_document_message_kept_first():
    """Keeps the original document message first on every call"""
    m = MockModel([BAD, BAD, GOOD])
    extract_with_retry(m, "INV-6 body", validate)
    assert all(s[0]["role"] == "user" and "INV-6 body" in s[0]["content"] for s in m.seen), \
        "Every call should start with the original user message containing the document."
