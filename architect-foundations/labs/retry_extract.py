"""Lab 4-3: Retry with error feedback.

call_model(messages) -> str            the model's JSON text
validate(obj)        -> {"ok": True}
                     or {"ok": False, "error": "due_date: expected YYYY-MM-DD", "retryable": True | False}

Return {"ok": bool, "data": ..., "attempts": number_of_model_calls}.
"""
import json


def extract_with_retry(call_model, doc_text, validate):
    messages = [{"role": "user", "content": "Extract the invoice fields as JSON.\n\n" + doc_text}]
    raw = call_model(messages)
    data = json.loads(raw)
    return {"ok": validate(data)["ok"], "data": data, "attempts": 1}
