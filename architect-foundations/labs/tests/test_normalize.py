"""Tests for Lab 1-4. Run from the labs folder: pytest tests/test_normalize.py"""
import copy

from normalize import post_tool_use

# Any of these spellings of the same UTC instant is accepted.
UTC = {"2024-05-31T16:08:37Z", "2024-05-31T16:08:37+00:00", "2024-05-31T16:08:37.000Z", "2024-05-31T16:08:37.000+00:00"}


def test_unix_seconds():
    """Unix seconds -> ISO 8601 UTC"""
    r = post_tool_use("lookup_order", {"created_at": 1717171717})
    assert r["created_at"] in UTC, f"created_at = {r['created_at']!r}"


def test_unix_milliseconds():
    """Unix milliseconds -> ISO 8601 UTC"""
    r = post_tool_use("billing", {"charged_at": 1717171717000})
    assert r["charged_at"] in UTC, f"charged_at = {r['charged_at']!r}"


def test_iso_with_offset():
    """ISO with an offset -> UTC"""
    r = post_tool_use("crm", {"updated_at": "2024-05-31T18:08:37+02:00"})
    assert r["updated_at"] in UTC, f"updated_at = {r['updated_at']!r}"


def test_status_codes():
    """Status codes -> words, unknown codes -> "unknown", strings lowercased"""
    got = [post_tool_use("x", {"status": s})["status"] for s in (2, 9, "DELIVERED")]
    assert got == ["shipped", "unknown", "delivered"], f"Got {got!r}"


def test_nested():
    """Recurses into nested lists and dicts"""
    r = post_tool_use("lookup_order", {"orders": [{"status": 3, "shipment": {"shipped_at": 1717171717}}]})
    order = r["orders"][0]
    assert order["status"] == "delivered" and order["shipment"]["shipped_at"] in UTC, f"Got {r!r}"


def test_other_fields_untouched():
    """Leaves other fields alone and doesn't mutate the input"""
    data = {"order_id": "A-1", "amount": 120, "note": "created_at was wrong", "status": 1, "items": [{"sku": "S1"}]}
    before = copy.deepcopy(data)
    r = post_tool_use("lookup_order", data)
    assert data == before, "The input dict was modified."
    assert (r["order_id"], r["amount"], r["note"], r["items"]) == ("A-1", 120, "created_at was wrong", [{"sku": "S1"}]), \
        f"Got {r!r}"
