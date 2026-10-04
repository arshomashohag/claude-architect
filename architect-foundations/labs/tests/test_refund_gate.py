"""Tests for Lab 1-3. Run from the labs folder: pytest tests/test_refund_gate.py"""
from refund_gate import pre_tool_use


def refund(amount, customer_id="C-88"):
    return {"tool": "process_refund", "input": {"customer_id": customer_id, "order_id": "A-1", "amount": amount}}


def session(verified="C-88"):
    return {"verified_customer_id": verified}


def is_deny(r):
    return isinstance(r, dict) and r.get("decision") == "deny" and isinstance(r.get("reason"), str) and r["reason"] != ""


def test_other_tools_allowed():
    """Allows other tools untouched"""
    r = pre_tool_use({"tool": "lookup_order", "input": {"order_id": "A-1"}}, session(None))
    assert r == {"decision": "allow"}, f"Got {r!r}"


def test_unverified_refund_denied():
    """Denies a refund before verification and points to get_customer"""
    r = pre_tool_use(refund(120), session(None))
    assert is_deny(r), f"Expected a deny with a reason; got {r!r}"
    assert "get_customer" in r["reason"], "Tell the agent what to do next: mention get_customer in the reason."


def test_verification_checked_first():
    """Checks verification before the amount (unverified $900 is denied, not escalated)"""
    r = pre_tool_use(refund(900), session(None))
    assert is_deny(r), f"Got {r!r}"


def test_other_customer_denied():
    """Denies a refund for a different customer than the verified one"""
    r = pre_tool_use(refund(120, "C-99"), session("C-88"))
    assert is_deny(r), f"Got {r!r}"


def test_bad_amounts_denied():
    """Denies a non-positive or non-numeric amount"""
    results = [pre_tool_use(refund(a), session()) for a in (0, "120", -5)]
    assert all(is_deny(r) for r in results), 'Amounts 0, "120" (a string) and -5 should all be denied.'


def test_over_limit_redirected():
    """Redirects refunds over $500 to escalate_to_human"""
    r = pre_tool_use(refund(740), session())
    assert isinstance(r, dict) and r.get("decision") == "redirect" and r.get("tool") == "escalate_to_human" \
        and r.get("reason"), f"Got {r!r}"


def test_exactly_limit_allowed():
    """Allows exactly $500 for the verified customer"""
    r = pre_tool_use(refund(500), session())
    assert r == {"decision": "allow"}, f'Got {r!r}. The limit is "over $500".'
