"""Lab 1-3: Write the refund gate.

This hook runs before every tool call the support agent makes.

call    = {"tool": "process_refund", "input": {"customer_id": "C-88", "order_id": "A-1", "amount": 120}}
session = {"verified_customer_id": "C-88"}   # None until get_customer verifies someone

Return one of:
    {"decision": "allow"}
    {"decision": "deny", "reason": "..."}
    {"decision": "redirect", "tool": "escalate_to_human", "reason": "..."}
"""


def pre_tool_use(call, session):
    return {"decision": "allow"}
