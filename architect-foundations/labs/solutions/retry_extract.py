"""Lab 4-3 reference solution."""
import json

MAX_ATTEMPTS = 3


def extract_with_retry(call_model, doc_text, validate):
    messages = [{"role": "user", "content": "Extract the invoice fields as JSON.\n\n" + doc_text}]
    last = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        raw = call_model(messages)
        data = None
        try:
            data = json.loads(raw)
            verdict = validate(data)
        except ValueError as err:  # json.JSONDecodeError is a ValueError
            verdict = {"ok": False, "error": f"Output was not valid JSON: {err}", "retryable": True}

        if verdict["ok"]:
            return {"ok": True, "data": data, "attempts": attempt}

        last = {"ok": False, "data": data, "attempts": attempt, "error": verdict["error"]}
        if verdict.get("retryable") is False:  # the source lacks it; retrying can't help
            return last

        messages.append({"role": "assistant", "content": raw})
        messages.append({"role": "user",
                         "content": f"That output failed validation: {verdict['error']}. Return corrected JSON only."})
    return last
