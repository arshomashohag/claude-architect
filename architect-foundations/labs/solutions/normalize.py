"""Lab 1-4 reference solution."""
from datetime import datetime, timezone

STATUS = {1: "pending", 2: "shipped", 3: "delivered", 4: "refunded"}


def to_iso(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        seconds = value / 1000 if value > 1e12 else value
        moment = datetime.fromtimestamp(seconds, tz=timezone.utc)
    elif isinstance(value, str):
        try:
            moment = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return value
        if moment.tzinfo is None:
            moment = moment.replace(tzinfo=timezone.utc)
    else:
        return value
    return moment.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def normalize(value, key=None):
    if isinstance(value, list):
        return [normalize(v) for v in value]
    if isinstance(value, dict):
        return {k: normalize(v, k) for k, v in value.items()}
    if key is not None and key.endswith("_at"):
        return to_iso(value)
    if key == "status" and not isinstance(value, bool):
        if isinstance(value, int):
            return STATUS.get(value, "unknown")
        if isinstance(value, str):
            return value.lower()
    return value


def post_tool_use(tool_name, result):
    return normalize(result)
