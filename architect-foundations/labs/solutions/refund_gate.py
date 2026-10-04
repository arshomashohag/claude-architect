"""Lab 1-3 reference solution."""

REFUND_LIMIT = 500


def pre_tool_use(call, session):
    if call["tool"] != "process_refund":
        return {"decision": "allow"}

    inp = call.get("input") or {}
    verified = session.get("verified_customer_id")
    if not verified:
        return {"decision": "deny", "reason": "Customer not verified. Call get_customer first."}
    if inp.get("customer_id") != verified:
        return {"decision": "deny", "reason": "Refund customer does not match the verified customer."}

    amount = inp.get("amount")
    if isinstance(amount, bool) or not isinstance(amount, (int, float)) or amount <= 0:
        return {"decision": "deny", "reason": "Refund amount must be a positive number."}
    if amount > REFUND_LIMIT:
        return {"decision": "redirect", "tool": "escalate_to_human",
                "reason": f"Refunds over ${REFUND_LIMIT} need human approval."}
    return {"decision": "allow"}
