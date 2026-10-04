"""Lab 4-4: Reconcile a message batch.

inputs : [{"custom_id": "doc-0001", "params": {...}}, ...]
results: [{"custom_id": ..., "result": {"type": "succeeded", "message": {"content": [{"type": "text", "text": ...}]}}}
          {"custom_id": ..., "result": {"type": "errored", "error": {"type": "invalid_request_error" | "api_error" | "overloaded_error"}}}
          {"custom_id": ..., "result": {"type": "expired"}}
          {"custom_id": ..., "result": {"type": "canceled"}}]

Results arrive in ANY order, and a result can be missing entirely.
Return {"texts": {custom_id: text}, "resubmit": [custom_id, ...], "needs_fix": [custom_id, ...]}
"""


def reconcile(inputs, results):
    texts = {}
    for i, item in enumerate(inputs):
        texts[item["custom_id"]] = results[i]["result"]["message"]["content"][0]["text"]
    return {"texts": texts, "resubmit": [], "needs_fix": []}
