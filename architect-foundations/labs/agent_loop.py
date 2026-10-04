"""Lab 1-1: Fix the agent loop.

client.create(messages=[...]) returns {"stop_reason": ..., "content": [...]}, where
content holds text blocks ({"type": "text", "text": ...}) and tool_use blocks
({"type": "tool_use", "id": ..., "name": ..., "input": {...}}).
tools[name](input) runs a tool and may raise.
Return the final messages list.

The mock client is synchronous and returns plain dicts so the lab stays on control
flow. The real SDK returns typed objects (response.stop_reason, block.type).
"""
import json


def run_agent(client, tools, user_text):
    messages = [{"role": "user", "content": user_text}]

    for _ in range(3):
        res = client.create(messages=messages)

        text = "".join(b["text"] for b in res["content"] if b["type"] == "text")
        if "DONE" in text:
            break

        for block in res["content"]:
            if block["type"] != "tool_use":
                continue
            out = tools[block["name"]](block["input"])
            messages.append({
                "role": "user",
                "content": [{"type": "tool_result", "tool_use_id": block["id"], "content": json.dumps(out)}],
            })
    return messages
