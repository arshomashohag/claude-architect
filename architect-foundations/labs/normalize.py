"""Lab 1-4: Normalize at the boundary.

post_tool_use runs after every MCP tool returns, before Claude sees the result.

- Any key ending in "_at": Unix seconds, Unix milliseconds (numbers above 1e12 are ms),
  or an ISO 8601 string -> ISO 8601 in UTC, e.g. "2024-05-31T16:08:37Z".
- "status": codes 1, 2, 3, 4 -> "pending", "shipped", "delivered", "refunded";
  any other number -> "unknown"; strings are lowercased.
- Recurse into nested dicts and lists. Leave every other field alone and don't
  mutate the input.
"""


def post_tool_use(tool_name, result):
    return result
