"""Tests for Lab 1-1. Run from the labs folder: pytest tests/test_agent_loop.py"""
import copy

from agent_loop import run_agent


class MockBudgetExceeded(Exception):
    pass


class MockClient:
    """Plays back a scripted model. script(n) returns the response for call n."""

    def __init__(self, script):
        self.script = script
        self.calls = 0
        self.seen = []  # a copy of the messages sent on each call

    def create(self, messages=None, **kwargs):
        if not isinstance(messages, list):
            raise TypeError("client.create needs messages=[...]")
        self.seen.append(copy.deepcopy(messages))
        self.calls += 1
        if self.calls > 25:
            raise MockBudgetExceeded("the model was called more than 25 times")
        res = self.script(self.calls)
        if res is None:
            raise AssertionError("The model was called again after it ended the turn.")
        return copy.deepcopy(res)


def tool_use(id, name, inp=None):
    return {"type": "tool_use", "id": id, "name": name, "input": inp or {}}


def text(t):
    return {"type": "text", "text": t}


TOOLS = {
    "lookup_order": lambda i: {"order_id": i.get("order_id"), "status": "shipped"},
    "get_customer": lambda i: {"id": "C-1", "verified": True},
}


def test_continues_when_text_says_done():
    """Keeps going when the text says DONE but stop_reason is tool_use"""
    def script(n):
        if n == 1:
            return {"stop_reason": "tool_use", "content": [
                text("DONE with the greeting. Checking the order now."),
                tool_use("t1", "lookup_order", {"order_id": "A1"})]}
        if n == 2:
            return {"stop_reason": "end_turn", "content": [text("Your order shipped.")]}

    c = MockClient(script)
    run_agent(c, TOOLS, "Where is order A1?")
    assert c.calls == 2, f"The model was called {c.calls} time(s); expected 2."


def test_appends_assistant_turn():
    """Appends the assistant turn before its tool results"""
    def script(n):
        if n == 1:
            return {"stop_reason": "tool_use", "content": [tool_use("t1", "lookup_order", {"order_id": "A1"})]}
        if n == 2:
            return {"stop_reason": "end_turn", "content": [text("Shipped.")]}

    c = MockClient(script)
    run_agent(c, TOOLS, "Where is order A1?")
    assert len(c.seen) >= 2, "The model was only called once."
    sent = c.seen[1]
    assistant, user = sent[-2], sent[-1]
    assert assistant["role"] == "assistant", \
        "The message before the tool results should be the assistant turn containing the tool_use block."
    assert any(b.get("type") == "tool_use" and b.get("id") == "t1" for b in assistant["content"]), \
        "The assistant turn should contain the original tool_use block (id t1)."
    assert user["role"] == "user", "The last message should be the user turn with the tool results."


def test_runs_until_end_turn():
    """Runs as many turns as the task needs and stops on end_turn"""
    def script(n):
        if n <= 5:
            return {"stop_reason": "tool_use", "content": [tool_use(f"t{n}", "lookup_order", {"order_id": f"A{n}"})]}
        if n == 6:
            return {"stop_reason": "end_turn", "content": [text("All five orders checked.")]}

    c = MockClient(script)
    run_agent(c, TOOLS, "Check orders A1 to A5")
    assert c.calls == 6, f"Expected 6 model calls (5 tool turns + end_turn); got {c.calls}."


def test_parallel_results_in_one_message():
    """Returns parallel tool results in ONE user message"""
    def script(n):
        if n == 1:
            return {"stop_reason": "tool_use", "content": [
                text("Checking both."),
                tool_use("t1", "get_customer", {"email": "a@b.co"}),
                tool_use("t2", "lookup_order", {"order_id": "A9"})]}
        if n == 2:
            return {"stop_reason": "end_turn", "content": [text("Done.")]}

    c = MockClient(script)
    run_agent(c, TOOLS, "Am I verified, and where is A9?")
    assert len(c.seen) >= 2, "The model was only called once."
    last = c.seen[1][-1]
    content = last["content"] if isinstance(last["content"], list) else []
    ids = [b["tool_use_id"] for b in content if b.get("type") == "tool_result"]
    assert last["role"] == "user" and sorted(ids) == ["t1", "t2"], \
        f"The last message held {len(ids)} tool_result block(s). Put both results in a single user message."


def test_failing_tool_reports_is_error():
    """Reports a failing tool with is_error instead of crashing"""
    def boom(_):
        raise TimeoutError("warehouse timeout")

    def script(n):
        if n == 1:
            return {"stop_reason": "tool_use", "content": [tool_use("t1", "lookup_order", {"order_id": "A1"})]}
        if n == 2:
            return {"stop_reason": "end_turn", "content": [text("The warehouse is slow; I'll retry shortly.")]}

    c = MockClient(script)
    run_agent(c, {"lookup_order": boom}, "Where is A1?")
    assert len(c.seen) >= 2, "The model never saw the failure."
    last = c.seen[1][-1]
    content = last["content"] if isinstance(last["content"], list) else []
    results = [b for b in content if b.get("type") == "tool_result" and b.get("tool_use_id") == "t1"]
    assert results, "No tool_result for t1 was sent back."
    assert results[0].get("is_error") is True, "The tool_result for the failed call should set is_error: True."


def test_has_backstop():
    """Has its own backstop for runaway loops (stops within 20 calls)"""
    c = MockClient(lambda n: {"stop_reason": "tool_use",
                              "content": [tool_use(f"t{n}", "lookup_order", {"order_id": "A1"})]})
    try:
        run_agent(c, TOOLS, "loop forever")
    except MockBudgetExceeded:
        raise AssertionError("The loop never stopped on its own.")
    except Exception:
        pass  # raising your own error at the cap is fine
    assert c.calls <= 20, f"The model was called {c.calls} times."
