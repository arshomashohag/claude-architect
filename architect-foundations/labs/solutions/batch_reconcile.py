"""Lab 4-4 reference solution."""


def reconcile(inputs, results):
    by_id = {r["custom_id"]: r["result"] for r in results}

    texts, resubmit, needs_fix = {}, [], []
    for item in inputs:
        cid = item["custom_id"]
        res = by_id.get(cid)
        if res is None:
            resubmit.append(cid)  # never came back
        elif res["type"] == "succeeded":
            texts[cid] = res["message"]["content"][0]["text"]
        elif res["type"] == "errored" and res.get("error", {}).get("type") == "invalid_request_error":
            needs_fix.append(cid)  # would fail again unchanged
        else:
            resubmit.append(cid)  # expired, canceled, api_error, overloaded_error
    return {"texts": texts, "resubmit": sorted(resubmit), "needs_fix": sorted(needs_fix)}
