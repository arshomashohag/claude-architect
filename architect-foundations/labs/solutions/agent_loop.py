"""Lab 1-1 reference solution."""
import json

MAX_TURNS = 20  # backstop for runaway loops, not the stop rule


def run_agent(client, tools, user_text):
    messages = [{"role": "user", "content": user_text}]

    for _ in range(MAX_TURNS):
        res = client.create(messages=messages)
        messages.append({"role": "assistant", "content": res["content"]})

        if res["stop_reason"] != "tool_use":  # end_turn (or another stop)
            return messages

        results = []
        for block in res["content"]:
            if block["type"] != "tool_use":
                continue
            try:
                out = tools[block["name"]](block["input"])
                results.append({"type": "tool_result", "tool_use_id": block["id"], "content": json.dumps(out)})
            except Exception as err:
                results.append({"type": "tool_result", "tool_use_id": block["id"],
                                "content": str(err), "is_error": True})
        messages.append({"role": "user", "content": results})  # one message for the whole batch

    raise RuntimeError(f"Agent exceeded {MAX_TURNS} turns")
