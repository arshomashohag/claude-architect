/* CCA-F Architect Lab: domain briefings and hands-on labs.
   Prose strings may use `backticks` for inline code and **double asterisks** for bold.
   Code labs: `harness` is serialized with Function.prototype.toString and run in a worker
   after the learner's code, so it must be self-contained and only use `check(name, fn)`. */

window.COURSE_DOMAINS = [
{ id: 1, name: "Agentic Architecture & Orchestration", short: "Agentic Architecture", tab: "Agentic", weight: 27,
  intro: "The largest domain. Loops that stop for the right reason, coordinators that own every handoff, and rules enforced in code when a prompt isn't good enough.",
  ts: [
  { n: "1.1", t: "Design and implement agentic loops",
    pts: ["Send → inspect `stop_reason` → on `tool_use`, run every `tool_use` block, append the assistant turn, then one user turn holding all `tool_result` blocks → repeat. Stop on `end_turn`.",
          "Model-driven decisions (Claude picks the next tool from context) fit work whose path is discovered at runtime. Fixed decision trees fit work you can specify in advance.",
          "An iteration cap is a backstop for runaway loops. It is never the stop rule."],
    trap: "Ending the loop because the text says \"done\" or because a text block came back. Responses often open with text before the `tool_use` block." },
  { n: "1.2", t: "Orchestrate coordinator–subagent systems",
    pts: ["Hub-and-spoke: the coordinator decomposes, delegates, aggregates, and routes every message and error. Subagents don't call each other.",
          "Pick subagents per query. A one-line factual question shouldn't run the full four-agent pipeline.",
          "Partition scope into distinct subtopics or source types, then check the synthesis for gaps and re-delegate targeted queries."],
    trap: "Blaming the search or synthesis agent for missing coverage that the coordinator's narrow decomposition caused." },
  { n: "1.3", t: "Configure subagent invocation and context passing",
    pts: ["Subagents start with isolated context. Put complete findings in their prompt; \"see above\" points at nothing.",
          "The coordinator needs the `Task` tool in `allowedTools`. Each `AgentDefinition` carries a description (used for routing), a system prompt, and a restricted tool list.",
          "Pass structured records that keep content apart from metadata (URL, title, date, page) so attribution survives the handoff.",
          "Run subagents in parallel by emitting several `Task` calls in one coordinator response. Brief them with goals and quality criteria, not step-by-step procedures."],
    trap: "Expecting a subagent to remember the coordinator's conversation." },
  { n: "1.4", t: "Enforce multi-step workflows and structure handoffs",
    pts: ["Prompt instructions fail some fraction of the time. When order is a compliance rule (verify identity before refunds), enforce it with a programmatic prerequisite that blocks the downstream tool.",
          "Split multi-issue requests into items, investigate them in parallel with shared context, then answer once.",
          "Escalation handoffs are structured: customer ID, root cause, amount, actions taken, recommended next step. The human can't read the transcript."],
    trap: "\"Move the rule to the top of the system prompt and add examples\" for a rule that must never be broken." },
  { n: "1.5", t: "Apply Agent SDK hooks",
    pts: ["Pre-tool hooks intercept outgoing calls to block or redirect them, such as sending refunds over $500 to `escalate_to_human`.",
          "`PostToolUse` hooks transform results before the model reads them: one timestamp format and one status vocabulary across MCP servers.",
          "Hooks give deterministic guarantees. Prompts give probabilistic compliance."],
    trap: "Asking the model in the prompt to convert every timestamp to ISO 8601." },
  { n: "1.6", t: "Choose a task decomposition strategy",
    pts: ["Prompt chaining (a fixed sequence) suits predictable multi-aspect work: review each file, then run a cross-file integration pass.",
          "Dynamic decomposition suits open-ended investigation: each step's findings generate the next subtasks."],
    trap: "A fixed pipeline for \"find out why the nightly build got three times slower\"." },
  { n: "1.7", t: "Manage session state, resumption, and forking",
    pts: ["Resume a session (`--resume`, SDK `resume`) to continue with its context intact.",
          "Fork (`--fork-session`, SDK `fork_session`) to try divergent approaches from one shared analysis baseline.",
          "When earlier tool results have gone stale, start a new session seeded with a structured summary and re-query live data."],
    trap: "Resuming yesterday's session and treating its order lookups as current." }
  ]},
{ id: 2, name: "Tool Design & MCP Integration", short: "Tools & MCP", tab: "Tools & MCP", weight: 18,
  intro: "Descriptions that route correctly, errors an agent can act on, and tool sets scoped to each agent's job.",
  ts: [
  { n: "2.1", t: "Design tool interfaces and descriptions",
    pts: ["The description is the main signal Claude uses to pick a tool. State the purpose, input formats, what comes back, and when to use a sibling tool instead.",
          "Vague or overlapping descriptions (\"Gets info\") cause misrouting. Rewrite, rename, or split overloaded tools before adding routing layers."],
    trap: "Putting a classifier in front of the agent when two tool descriptions are nearly identical." },
  { n: "2.2", t: "Return structured MCP errors",
    pts: ["Set `isError: true` and include `errorCategory` (transient, validation, business, permission), `isRetryable`, a readable message, the attempted query, and any partial results.",
          "Business-rule failures aren't retryable and need a customer-facing explanation. Subagents retry transient failures locally and escalate only what they can't resolve.",
          "A query that succeeded and matched nothing is a valid empty result, not an error."],
    trap: "One generic \"Operation failed\" for everything, or `[]` on a timeout." },
  { n: "2.3", t: "Distribute tools and configure tool choice",
    pts: ["Selection gets less reliable as tool count and overlap grow. Give each agent the four or five tools its role needs.",
          "Scope by role: a synthesizer gets a narrow `verify_fact`, not open web search. Replace generic tools (`run_sql`) with constrained ones (`get_order_status`).",
          "`tool_choice: auto` lets Claude decide. The exam guide also covers forced `any`/named-tool choice; Claude Opus 5.5, Sonnet 5.5 and Fable 5.1 reject those with a 400, so pair `auto` with a prompt instruction, `strict: true`, or structured outputs."],
    trap: "\"18 tools is fine if each one is strict.\" Strict mode validates arguments; it doesn't help Claude choose." },
  { n: "2.4", t: "Integrate MCP servers",
    pts: ["Project scope: `.mcp.json` at the repo root, committed, shared. User scope: `~/.claude.json`, personal.",
          "Keep secrets out of the file with environment expansion: `\"${GITHUB_TOKEN}\"`.",
          "MCP resources expose catalogs (documents, schemas) so the agent sees what exists without exploratory calls. Prefer a maintained community server; build custom only for team-specific workflows."],
    trap: "Committing a token in `.mcp.json`, or configuring team servers in each person's user scope." },
  { n: "2.5", t: "Use the built-in tools well",
    pts: ["Grep searches contents. Glob matches paths. Read before changing. Edit needs a unique anchor. Write creates or replaces a whole file. Bash runs commands.",
          "If Edit can't find a unique match, lengthen the anchor; failing that, Read the file and Write the full revision.",
          "Explore incrementally: Glob and Grep to map the code, then Read only what matters."],
    trap: "Reading every file top to bottom to \"understand the codebase\"." }
  ]},
{ id: 3, name: "Claude Code Configuration & Workflows", short: "Claude Code", tab: "Claude Code", weight: 20,
  intro: "Where configuration lives and who it reaches, how to run Claude Code headless in CI, and when to plan before acting.",
  ts: [
  { n: "3.1", t: "Configure the CLAUDE.md hierarchy",
    pts: ["User `~/.claude/CLAUDE.md`: personal, every project, not shared. Project `./CLAUDE.md` or `./.claude/CLAUDE.md`: committed, whole team. Subdirectory `CLAUDE.md`: loaded when Claude works in that folder.",
          "Keep the root file lean. Move topics into imported files (`@docs/testing.md`) or `.claude/rules/`.",
          "`/memory` lists the memory files in play. The Agent SDK loads filesystem settings, CLAUDE.md included, only when you opt in with setting sources."],
    trap: "Team conventions in one engineer's user-level file. They work for that engineer and nobody else." },
  { n: "3.2", t: "Build slash commands and skills",
    pts: ["`.claude/commands/` and `.claude/skills/<name>/SKILL.md` ship with the repo. The `~/.claude/` versions are personal.",
          "SKILL.md frontmatter: `description` (when to use it), `argument-hint`, `allowed-tools` to restrict what it may touch, and `context: fork` to run it in an isolated subagent so verbose output stays out of the main conversation."],
    trap: "Writing \"never modify files\" in a skill body instead of restricting `allowed-tools`." },
  { n: "3.3", t: "Apply path-specific rules",
    pts: ["Files in `.claude/rules/` with YAML frontmatter `paths:` (globs) load only when Claude works on matching files.",
          "They fit conventions that cut across folders (`**/*.test.tsx`, `**/*.tf`). A subdirectory CLAUDE.md fits one folder's local rules."],
    trap: "Copying one CLAUDE.md into forty test directories." },
  { n: "3.4", t: "Choose plan mode or direct execution",
    pts: ["Plan mode for large or multi-file changes, several viable approaches, or architectural choices: explore read-only, agree the plan, then execute.",
          "Direct execution for small, well-scoped changes with an obvious fix.",
          "The Explore subagent keeps verbose discovery out of the main context and returns a summary."],
    trap: "Plan mode for a typo, or direct execution for a 120-file migration." },
  { n: "3.5", t: "Refine iteratively",
    pts: ["Concrete input→output examples and failing tests beat restated prose. Iterate test-first.",
          "Interview pattern: when requirements are fuzzy, have Claude ask you the design questions before it writes code.",
          "Report interacting problems together in one message. Independent ones can go one at a time."],
    trap: "Rewording the same requirement in capitals for the fourth time." },
  { n: "3.6", t: "Run Claude Code in CI/CD",
    pts: ["`claude -p` runs non-interactively. `--output-format json` with `--json-schema` returns findings you can post as inline comments.",
          "CLAUDE.md gives CI runs the same project standards developers get.",
          "Review in an independent session; the session that wrote the code still holds its reasoning. Feed in prior findings and ask only for new or unaddressed issues."],
    trap: "Regex over prose output, or telling the generating session to \"be critical\"." }
  ]},
{ id: 4, name: "Prompt Engineering & Structured Output", short: "Prompts & Output", tab: "Prompts", weight: 20,
  intro: "Precision through explicit criteria, schemas that admit uncertainty, retries that carry the error, and the economics of batches.",
  ts: [
  { n: "4.1", t: "Write explicit criteria",
    pts: ["Say exactly what to report and what to skip, with each severity level illustrated by concrete code. \"Be conservative\" doesn't raise precision.",
          "If one category's false positives are eroding trust, switch that category off while you fix its criteria."],
    trap: "Capping comments at five instead of defining what counts as a finding." },
  { n: "4.2", t: "Use few-shot examples",
    pts: ["Two to four targeted examples of the ambiguous cases, each showing why one choice beats the other.",
          "Cover the formats you actually receive (tables, letters, scans) and show absent fields as null."],
    trap: "Thirty examples of easy cases." },
  { n: "4.3", t: "Enforce structure with tools and schemas",
    pts: ["A tool schema with `strict: true`, or `output_config.format`, guarantees structure. It doesn't make the values right.",
          "Make fields nullable when documents may lack them. Add \"other\" (with a detail field) and \"unclear\" to enums.",
          "Assistant prefill returns a 400 on current models, so it can't be your JSON strategy."],
    trap: "Treating schema-valid output as correct output." },
  { n: "4.4", t: "Validate, retry, and self-correct",
    pts: ["Retry with the specific validation error appended, and cap the attempts.",
          "Retries can't recover information the source doesn't contain. Return null or route to a person.",
          "Self-checks: extract `stated_total`, compute `calculated_total`, set `conflict_detected`. A `detected_pattern` field lets you analyze dismissals."],
    trap: "Resending the identical prompt and hoping." },
  { n: "4.5", t: "Process in batches",
    pts: ["Message Batches cost 50% less, finish within 24 hours with no latency SLA, and return results in any order keyed by `custom_id`.",
          "Good fits: overnight jobs, backfills, evals. Poor fits: blocking pre-merge checks, live agents, multi-turn client tool loops.",
          "Refine the prompt on a sample first. Resubmit only what failed."],
    trap: "Moving the blocking PR check to batches to save half the cost." },
  { n: "4.6", t: "Design multi-pass review",
    pts: ["Self-review is weak because the session keeps its own reasoning. Use an independent instance.",
          "Large reviews: per-file local passes, then a cross-file integration pass.",
          "Per-finding confidence helps routing only after you calibrate it against real outcomes."],
    trap: "One giant pass over a 40-file pull request." }
  ]},
{ id: 5, name: "Context Management & Reliability", short: "Context & Reliability", tab: "Reliability", weight: 15,
  intro: "Keeping the facts that matter, escalating for the right reasons, propagating errors honestly, and knowing where accuracy is weak.",
  ts: [
  { n: "5.1", t: "Preserve critical information",
    pts: ["Progressive summarization drops exact amounts, dates, IDs and promises. Keep them in a persistent case-facts block.",
          "Trim verbose tool output to the fields the task uses.",
          "For long inputs, lead with key findings and use explicit section headers to blunt lost-in-the-middle effects."],
    trap: "Letting a rolling summary decide whether \"$312.50 refunded on June 1\" survives." },
  { n: "5.2", t: "Escalate and resolve ambiguity",
    pts: ["Escalate on an explicit request for a human (right away), a policy exception or gap, or no meaningful progress.",
          "Sentiment and self-reported confidence are poor triggers.",
          "Several records match: ask for an identifier. Never pick one by heuristic."],
    trap: "Escalating an angry customer whose return is routine." },
  { n: "5.3", t: "Propagate errors across agents",
    pts: ["Subagents recover from transient errors locally and return structured context for the rest: failure type, attempted query, partial results, alternatives.",
          "Never report failure as an empty success. Never abort the whole run because one branch failed.",
          "Synthesis annotates coverage: what was researched and what couldn't be."],
    trap: "\"No studies found\" in the report when the search actually timed out." },
  { n: "5.4", t: "Explore large codebases without losing the thread",
    pts: ["Long sessions degrade; answers drift toward \"typical patterns\". Persist findings in a scratchpad file and delegate verbose discovery to subagents.",
          "Use `/compact`, or start fresh seeded with a summary. Keep a progress manifest for crash recovery."],
    trap: "Treating degradation by pasting the original instructions again." },
  { n: "5.5", t: "Design human review and calibrate confidence",
    pts: ["Aggregate accuracy hides weak segments. Measure by document type and by field.",
          "Calibrate field-level confidence on a labeled validation set and route low-confidence fields to people.",
          "Keep stratified random sampling of the auto-accepted stream to catch new error patterns."],
    trap: "\"97% overall, so switch human review off.\"" },
  { n: "5.6", t: "Preserve provenance and handle conflicts",
    pts: ["Keep claim→source mappings (URL, title, date, page) through every handoff.",
          "When figures conflict, show both with sources and dates. Don't average them or silently pick one.",
          "Render by content type: financial data as tables, narrative as prose."],
    trap: "Adding citations at the end from memory." }
  ]}
];

window.COURSE_LABS = [
/* =========================== DOMAIN 1 =========================== */
{ id: "1-1", d: 1, ts: "1.1", type: "code", mins: 20, title: "Fix the agent loop",
  summary: "Repair a support agent's loop against a scripted mock model. Six tests.",
  brief: ["This loop shipped last sprint. In production it stops halfway through investigations, forgets which tool it called, and crashes when the warehouse API times out.",
          "Rewrite `runAgent` so all six tests pass. The mock `client.create()` is synchronous to keep the exercise on control flow; the real SDK call is async."],
  spec: ["`client.create({ messages })` returns `{ stop_reason, content }`, where `content` holds `text` and `tool_use` blocks (`{ type, id, name, input }`).",
         "`tools[name](input)` runs a tool and may throw.",
         "Return the final `messages` array."],
  fn: "runAgent",
  starter: [
"function runAgent(client, tools, userText) {",
"  const messages = [{ role: \"user\", content: userText }];",
"",
"  for (let i = 0; i < 3; i++) {",
"    const res = client.create({ messages });",
"",
"    const text = res.content.filter(b => b.type === \"text\").map(b => b.text).join(\"\");",
"    if (text.includes(\"DONE\")) break;",
"",
"    for (const block of res.content) {",
"      if (block.type !== \"tool_use\") continue;",
"      const out = tools[block.name](block.input);",
"      messages.push({",
"        role: \"user\",",
"        content: [{ type: \"tool_result\", tool_use_id: block.id, content: JSON.stringify(out) }]",
"      });",
"    }",
"  }",
"  return messages;",
"}"].join("\n"),
  solution: [
"function runAgent(client, tools, userText) {",
"  const messages = [{ role: \"user\", content: userText }];",
"  const MAX_TURNS = 20; // backstop for runaway loops, not the stop rule",
"",
"  for (let turn = 0; turn < MAX_TURNS; turn++) {",
"    const res = client.create({ messages });",
"    messages.push({ role: \"assistant\", content: res.content });",
"",
"    if (res.stop_reason !== \"tool_use\") return messages; // end_turn (or another stop)",
"",
"    const results = [];",
"    for (const block of res.content) {",
"      if (block.type !== \"tool_use\") continue;",
"      try {",
"        const out = tools[block.name](block.input);",
"        results.push({ type: \"tool_result\", tool_use_id: block.id, content: JSON.stringify(out) });",
"      } catch (err) {",
"        results.push({ type: \"tool_result\", tool_use_id: block.id,",
"                       content: String(err && err.message || err), is_error: true });",
"      }",
"    }",
"    messages.push({ role: \"user\", content: results }); // one message for the whole batch",
"  }",
"  throw new Error(\"Agent exceeded \" + MAX_TURNS + \" turns\");",
"}"].join("\n"),
  harness: function harness() {
    function mk(script) {
      var c = { calls: 0, seen: [] };
      c.create = function (req) {
        if (!req || !Array.isArray(req.messages)) throw new Error("client.create needs { messages: [...] }");
        c.seen.push(JSON.parse(JSON.stringify(req.messages)));
        c.calls++;
        if (c.calls > 25) throw new Error("MOCK_BUDGET: the model was called more than 25 times");
        var r = script(c.calls);
        if (!r) throw new Error("MOCK_EXHAUSTED: the model was called again after it ended the turn");
        return JSON.parse(JSON.stringify(r));
      };
      return c;
    }
    function tu(id, name, input) { return { type: "tool_use", id: id, name: name, input: input || {} }; }
    function tx(t) { return { type: "text", text: t }; }
    var tools = {
      lookup_order: function (i) { return { order_id: i.order_id, status: "shipped" }; },
      get_customer: function () { return { id: "C-1", verified: true }; }
    };
    check("Keeps going when the text says DONE but stop_reason is tool_use", function () {
      var c = mk(function (n) {
        if (n === 1) return { stop_reason: "tool_use", content: [tx("DONE with the greeting. Checking the order now."), tu("t1", "lookup_order", { order_id: "A1" })] };
        if (n === 2) return { stop_reason: "end_turn", content: [tx("Your order shipped.")] };
      });
      runAgent(c, tools, "Where is order A1?");
      return c.calls === 2 || ("The model was called " + c.calls + " time(s); expected 2.");
    });
    check("Appends the assistant turn before its tool results", function () {
      var c = mk(function (n) {
        if (n === 1) return { stop_reason: "tool_use", content: [tu("t1", "lookup_order", { order_id: "A1" })] };
        if (n === 2) return { stop_reason: "end_turn", content: [tx("Shipped.")] };
      });
      runAgent(c, tools, "Where is order A1?");
      var m = c.seen[1];
      if (!m) return "The model was only called once.";
      var a = m[m.length - 2], u = m[m.length - 1];
      if (!a || a.role !== "assistant") return "The message before the tool results should be the assistant turn containing the tool_use block.";
      var hasUse = Array.isArray(a.content) && a.content.some(function (b) { return b.type === "tool_use" && b.id === "t1"; });
      if (!hasUse) return "The assistant turn should contain the original tool_use block (id t1).";
      return (u && u.role === "user") || "The last message should be the user turn with tool results.";
    });
    check("Runs as many turns as the task needs and stops on end_turn", function () {
      var c = mk(function (n) {
        if (n <= 5) return { stop_reason: "tool_use", content: [tu("t" + n, "lookup_order", { order_id: "A" + n })] };
        if (n === 6) return { stop_reason: "end_turn", content: [tx("All five orders checked.")] };
      });
      runAgent(c, tools, "Check orders A1 to A5");
      return c.calls === 6 || ("Expected 6 model calls (5 tool turns + end_turn); got " + c.calls + ".");
    });
    check("Returns parallel tool results in ONE user message", function () {
      var c = mk(function (n) {
        if (n === 1) return { stop_reason: "tool_use", content: [tx("Checking both."), tu("t1", "get_customer", { email: "a@b.co" }), tu("t2", "lookup_order", { order_id: "A9" })] };
        if (n === 2) return { stop_reason: "end_turn", content: [tx("Done.")] };
      });
      runAgent(c, tools, "Am I verified, and where is A9?");
      var m = c.seen[1]; if (!m) return "The model was only called once.";
      var last = m[m.length - 1];
      var ids = Array.isArray(last.content) ? last.content.filter(function (b) { return b.type === "tool_result"; }).map(function (b) { return b.tool_use_id; }) : [];
      return (last.role === "user" && ids.length === 2 && ids.indexOf("t1") >= 0 && ids.indexOf("t2") >= 0) ||
        ("The last message held " + ids.length + " tool_result block(s). Put both results in a single user message.");
    });
    check("Reports a failing tool with is_error instead of crashing", function () {
      var failing = { lookup_order: function () { throw new Error("warehouse timeout"); } };
      var c = mk(function (n) {
        if (n === 1) return { stop_reason: "tool_use", content: [tu("t1", "lookup_order", { order_id: "A1" })] };
        if (n === 2) return { stop_reason: "end_turn", content: [tx("The warehouse system is slow; I'll retry shortly.")] };
      });
      runAgent(c, failing, "Where is A1?");
      var m = c.seen[1]; if (!m) return "The model never saw the failure.";
      var last = m[m.length - 1];
      var r = Array.isArray(last.content) && last.content.filter(function (b) { return b.type === "tool_result" && b.tool_use_id === "t1"; })[0];
      if (!r) return "No tool_result for t1 was sent back.";
      return r.is_error === true || "The tool_result for the failed call should set is_error: true.";
    });
    check("Has its own backstop for runaway loops (stops within 20 calls)", function () {
      var c = mk(function (n) { return { stop_reason: "tool_use", content: [tu("t" + n, "lookup_order", { order_id: "A1" })] }; });
      try { runAgent(c, tools, "loop forever"); } catch (e) {
        if (String(e && e.message).indexOf("MOCK_BUDGET") >= 0) return "The loop never stopped on its own.";
      }
      return c.calls <= 20 || ("The model was called " + c.calls + " times.");
    });
  },
  takeaway: "Stop on `stop_reason`, never on prose. Append the assistant turn, answer every `tool_use` (failures with `is_error: true`) in one user message, and keep a turn cap only as a backstop." },

{ id: "1-2", d: 1, ts: "1.2 · 1.3", type: "defect", mins: 12, title: "Code review: the research coordinator",
  summary: "Four snippets from a multi-agent research system. Click the lines that cause the bug.",
  brief: ["A teammate's coordinator for the research system produces thin, uncited reports and takes four minutes per query. Each snippet below has a reported symptom. Select the line or lines responsible, then check."],
  rounds: [
  { title: "Symptom: the synthesizer writes generic text unrelated to the research",
    code: [
"findings = await run_searchers(subtopics)      # list of {claim, url, title, date}",
"analysis = await run_doc_analyst(documents)",
"",
"synth_prompt = \"Synthesize the research gathered so far into a cited summary.\"",
"draft = await run_subagent(\"synthesizer\", synth_prompt)",
"return draft"],
    bad: [3],
    why: "Subagents don't inherit the coordinator's context. \"The research gathered so far\" refers to nothing the synthesizer can see. The findings and analysis, with their source metadata, have to be in the prompt.",
    fix: "synth_prompt = render_synthesis_brief(goal, findings=findings, analysis=analysis)  # full records incl. url/title/date" },
  { title: "Symptom: the coordinator never delegates; it tries to search and read everything itself",
    code: [
"options = ClaudeAgentOptions(",
"    system_prompt=COORDINATOR_PROMPT,",
"    allowed_tools=[\"WebSearch\", \"Read\"],",
"    agents={",
"        \"searcher\": AgentDefinition(description=SEARCHER_DESC, prompt=SEARCHER_PROMPT,",
"                                   tools=[\"WebSearch\", \"WebFetch\"]),",
"        \"synthesizer\": AgentDefinition(description=SYNTH_DESC, prompt=SYNTH_PROMPT,",
"                                      tools=[\"mcp__facts__verify_fact\"]),",
"    },",
")"],
    bad: [2],
    why: "The coordinator spawns subagents through the `Task` tool, so `allowed_tools` must include \"Task\". Without it, the agents are defined but unreachable. Giving the coordinator WebSearch also invites it to do the searchers' job.",
    fix: "    allowed_tools=[\"Task\", \"Read\"]," },
  { title: "Symptom: research takes four minutes and subagents follow brittle scripts",
    code: [
"COORDINATOR_PROMPT = \"\"\"",
"You coordinate research on the user's topic.",
"Delegate one subtopic at a time and wait for each searcher to finish before starting the next.",
"Tell each searcher: Step 1, search '<subtopic> market size 2024'. Step 2, open the first three results.",
"Step 3, copy every number you find.",
"A subtopic is done when it has at least three independent sources from the last 24 months.",
"Route all results back through you before synthesis.",
"\"\"\""],
    bad: [2, 3, 4],
    why: "Line 3 serializes the work; the coordinator should emit several Task calls in one response so searchers run in parallel. Lines 4–5 are step-by-step procedure; brief subagents with goals and quality criteria (line 6 is a good one) and let them choose their steps.",
    fix: "Spawn all searchers in a single response. For each, state the subtopic, scope boundaries, and what counts as done (sources, recency)." },
  { title: "Symptom: errors vanish and nobody can trace which agent said what",
    code: [
"SEARCHER_TOOLS = [",
"    \"WebSearch\",",
"    \"WebFetch\",",
"    \"mcp__agents__send_to_synthesizer\",   # pushes results straight to the synthesizer",
"]",
"",
"def on_subagent_result(result):",
"    coordinator.log(result)",
"    coordinator.findings.append(result)"],
    bad: [3],
    why: "Hub-and-spoke: every message and error goes through the coordinator. A searcher pushing directly to the synthesizer bypasses the coordinator's logging, error handling, and gap checks.",
    fix: "Remove send_to_synthesizer. Searchers return to the coordinator, which decides what the synthesizer receives." }
  ],
  takeaway: "The coordinator owns the graph: it holds the `Task` tool, fans out in one response, passes complete context explicitly, and is the only route between subagents." },

{ id: "1-3", d: 1, ts: "1.4 · 1.5", type: "code", mins: 15, title: "Write the refund gate",
  summary: "Implement a pre-tool hook that enforces verification and the $500 limit in code.",
  brief: ["The support agent's prompt says \"verify the customer before refunding\" and \"refunds over $500 need a human\". Last month 3% of refunds skipped verification. Compliance wants a guarantee, so the rules move into a hook that runs before every tool call.",
          "Implement `preToolUse`. Check the rules in the order listed."],
  spec: ["Any tool other than `process_refund` → `{ decision: \"allow\" }`.",
         "No verified customer yet (`session.verifiedCustomerId` is null) → deny. The reason should tell the agent to call `get_customer` first.",
         "`input.customer_id` differs from the verified customer → deny.",
         "`input.amount` is not a positive number → deny.",
         "`input.amount` over 500 → `{ decision: \"redirect\", tool: \"escalate_to_human\", reason }`.",
         "Otherwise allow. Every deny or redirect carries a non-empty `reason`."],
  fn: "preToolUse",
  starter: [
"// call    = { tool: \"process_refund\", input: { customer_id: \"C-88\", order_id: \"A-1\", amount: 120 } }",
"// session = { verifiedCustomerId: \"C-88\" }   // null until get_customer verifies someone",
"//",
"// Return { decision: \"allow\" }",
"//     or { decision: \"deny\", reason: \"...\" }",
"//     or { decision: \"redirect\", tool: \"escalate_to_human\", reason: \"...\" }",
"function preToolUse(call, session) {",
"  return { decision: \"allow\" };",
"}"].join("\n"),
  solution: [
"function preToolUse(call, session) {",
"  if (call.tool !== \"process_refund\") return { decision: \"allow\" };",
"  const input = call.input || {};",
"  if (!session.verifiedCustomerId) {",
"    return { decision: \"deny\", reason: \"Customer not verified. Call get_customer first.\" };",
"  }",
"  if (input.customer_id !== session.verifiedCustomerId) {",
"    return { decision: \"deny\", reason: \"Refund customer does not match the verified customer.\" };",
"  }",
"  if (typeof input.amount !== \"number\" || !(input.amount > 0)) {",
"    return { decision: \"deny\", reason: \"Refund amount must be a positive number.\" };",
"  }",
"  if (input.amount > 500) {",
"    return { decision: \"redirect\", tool: \"escalate_to_human\",",
"             reason: \"Refunds over $500 need human approval.\" };",
"  }",
"  return { decision: \"allow\" };",
"}"].join("\n"),
  harness: function harness() {
    function R(amount, cid) { return { tool: "process_refund", input: { customer_id: cid || "C-88", order_id: "A-1", amount: amount } }; }
    function S(v) { return { verifiedCustomerId: v === undefined ? "C-88" : v }; }
    function isDeny(r) { return r && r.decision === "deny" && typeof r.reason === "string" && r.reason.length > 0; }
    check("Allows other tools untouched", function () {
      var r = preToolUse({ tool: "lookup_order", input: { order_id: "A-1" } }, S(null));
      return (r && r.decision === "allow") || ("Got " + JSON.stringify(r));
    });
    check("Denies a refund before verification and points to get_customer", function () {
      var r = preToolUse(R(120), S(null));
      if (!isDeny(r)) return "Expected a deny with a reason; got " + JSON.stringify(r);
      return /get_customer/.test(r.reason) || "Tell the agent what to do next: mention get_customer in the reason.";
    });
    check("Checks verification before the amount (unverified $900 is denied, not escalated)", function () {
      var r = preToolUse(R(900), S(null));
      return isDeny(r) || ("Got " + JSON.stringify(r));
    });
    check("Denies a refund for a different customer than the verified one", function () {
      var r = preToolUse(R(120, "C-99"), S("C-88"));
      return isDeny(r) || ("Got " + JSON.stringify(r));
    });
    check("Denies a non-positive or non-numeric amount", function () {
      var a = preToolUse(R(0), S()), b = preToolUse(R("120"), S()), c = preToolUse(R(-5), S());
      return (isDeny(a) && isDeny(b) && isDeny(c)) || "Amounts 0, \"120\" (a string) and -5 should all be denied.";
    });
    check("Redirects refunds over $500 to escalate_to_human", function () {
      var r = preToolUse(R(740), S());
      return (r && r.decision === "redirect" && r.tool === "escalate_to_human" && !!r.reason) || ("Got " + JSON.stringify(r));
    });
    check("Allows exactly $500 for the verified customer", function () {
      var r = preToolUse(R(500), S());
      return (r && r.decision === "allow") || ("Got " + JSON.stringify(r) + ". The limit is \"over $500\".");
    });
  },
  takeaway: "When a rule must hold every time, it belongs in code the model can't skip. The hook also tells the agent what to do next (verify, or escalate) so the conversation recovers." },

{ id: "1-4", d: 1, ts: "1.5", type: "code", mins: 15, title: "Normalize at the boundary",
  summary: "Write a PostToolUse transform that unifies timestamps and status codes from three MCP servers.",
  brief: ["Three MCP servers feed the support agent. The warehouse returns Unix seconds, billing returns Unix milliseconds, the CRM returns ISO 8601 with offsets, and order status arrives as numeric codes. The agent has been comparing 1717171717 with \"2024-05-31T18:08:37+02:00\" and getting the order of events wrong.",
          "Implement `postToolUse` so every result reaches the model in one format."],
  spec: ["Any key ending in `_at`: Unix seconds, Unix milliseconds (treat numbers above 1e12 as ms), or an ISO 8601 string → ISO 8601 UTC, e.g. `\"2024-05-31T16:08:37.000Z\"`.",
         "`status`: codes 1, 2, 3, 4 → `\"pending\"`, `\"shipped\"`, `\"delivered\"`, `\"refunded\"`; any other number → `\"unknown\"`; strings are lowercased.",
         "Recurse into nested objects and arrays. Leave every other field alone, and don't mutate the input."],
  fn: "postToolUse",
  starter: [
"// Runs after every MCP tool returns, before Claude sees the result.",
"function postToolUse(toolName, result) {",
"  return result;",
"}"].join("\n"),
  solution: [
"const STATUS = { 1: \"pending\", 2: \"shipped\", 3: \"delivered\", 4: \"refunded\" };",
"",
"function toIso(v) {",
"  if (typeof v === \"number\") return new Date(v > 1e12 ? v : v * 1000).toISOString();",
"  if (typeof v === \"string\") {",
"    const d = new Date(v);",
"    return isNaN(d) ? v : d.toISOString();",
"  }",
"  return v;",
"}",
"",
"function normalize(value, key) {",
"  if (Array.isArray(value)) return value.map(v => normalize(v));",
"  if (value && typeof value === \"object\") {",
"    const out = {};",
"    for (const k of Object.keys(value)) out[k] = normalize(value[k], k);",
"    return out;",
"  }",
"  if (key && /_at$/.test(key)) return toIso(value);",
"  if (key === \"status\") {",
"    if (typeof value === \"number\") return STATUS[value] || \"unknown\";",
"    if (typeof value === \"string\") return value.toLowerCase();",
"  }",
"  return value;",
"}",
"",
"function postToolUse(toolName, result) {",
"  return normalize(result);",
"}"].join("\n"),
  harness: function harness() {
    var ISO = "2024-05-31T16:08:37.000Z";
    check("Unix seconds → ISO 8601 UTC", function () {
      var r = postToolUse("lookup_order", { created_at: 1717171717 });
      return (r && r.created_at === ISO) || ("created_at = " + JSON.stringify(r && r.created_at));
    });
    check("Unix milliseconds → ISO 8601 UTC", function () {
      var r = postToolUse("billing", { charged_at: 1717171717000 });
      return (r && r.charged_at === ISO) || ("charged_at = " + JSON.stringify(r && r.charged_at));
    });
    check("ISO with an offset → UTC", function () {
      var r = postToolUse("crm", { updated_at: "2024-05-31T18:08:37+02:00" });
      return (r && r.updated_at === ISO) || ("updated_at = " + JSON.stringify(r && r.updated_at));
    });
    check("Status codes → words, unknown codes → \"unknown\", strings lowercased", function () {
      var a = postToolUse("x", { status: 2 }), b = postToolUse("x", { status: 9 }), c = postToolUse("x", { status: "DELIVERED" });
      var ok = a && a.status === "shipped" && b && b.status === "unknown" && c && c.status === "delivered";
      return ok || ("Got " + JSON.stringify([a && a.status, b && b.status, c && c.status]));
    });
    check("Recurses into nested arrays and objects", function () {
      var r = postToolUse("lookup_order", { orders: [{ status: 3, shipment: { shipped_at: 1717171717 } }] });
      var o = r && r.orders && r.orders[0];
      return (o && o.status === "delivered" && o.shipment && o.shipment.shipped_at === ISO) || ("Got " + JSON.stringify(r));
    });
    check("Leaves other fields alone and doesn't mutate the input", function () {
      var input = { order_id: "A-1", amount: 120, note: "created_at was wrong", status: 1, items: [{ sku: "S1" }] };
      var copy = JSON.stringify(input);
      var r = postToolUse("lookup_order", input);
      if (JSON.stringify(input) !== copy) return "The input object was modified.";
      return (r.order_id === "A-1" && r.amount === 120 && r.note === "created_at was wrong" && r.items[0].sku === "S1") || ("Got " + JSON.stringify(r));
    });
  },
  takeaway: "Normalize once, at the boundary, in code. The model then reasons over one vocabulary, and no prompt instruction has to remember three formats." },

{ id: "1-5", d: 1, ts: "1.4", type: "classify", mins: 6, title: "Pack the escalation handoff",
  summary: "Decide what goes into escalate_to_human for an agent who can't see the transcript.",
  brief: ["A customer's $740 refund for a mis-delivered TV exceeds the $500 auto-approve limit, so the hook redirected it to `escalate_to_human`. The human agent sees only the handoff payload. For each candidate field, decide whether it belongs."],
  buckets: ["Include", "Leave out"],
  items: [
    { t: "Verified customer ID `C-88213` and how it was verified (email + postcode)", a: 0, why: "The human must not have to re-verify, and needs to know verification already happened." },
    { t: "Order ID `A-204918` and the refund amount at stake ($740)", a: 0, why: "The exact identifiers and amount are the core of the case." },
    { t: "Why it escalated: amount exceeds the $500 auto-approve limit", a: 0, why: "States what decision the human is being asked to make." },
    { t: "Root cause found: carrier GPS shows delivery to 14 Elm St; the customer lives at 41 Elm St", a: 0, why: "Investigation results save the human from repeating the lookups." },
    { t: "Actions already taken: replacement offered, customer declined", a: 0, why: "Prevents the human from re-offering something already refused." },
    { t: "Recommended next action: approve the full refund and file a carrier claim", a: 0, why: "A recommendation lets the human confirm rather than start from scratch." },
    { t: "The entire 64-turn transcript pasted verbatim", a: 1, why: "The handoff is a structured summary. Dumping the transcript buries the decision; link to it if your system allows." },
    { t: "The agent's self-reported confidence (0.62)", a: 1, why: "Uncalibrated self-confidence doesn't help the human decide and invites anchoring." },
    { t: "Customer's stated preference: refund to the original card, not store credit", a: 0, why: "A constraint the resolution has to honour." },
    { t: "Latency metrics for each MCP call in the session", a: 1, why: "Operational telemetry belongs in your logs, not in the human's case view." }
  ],
  takeaway: "A handoff carries identity, the decision needed, what was found, what was tried, and a recommendation. Everything else stays in logs." },

{ id: "1-6", d: 1, ts: "1.3 · 2.3", type: "fill", mins: 8, title: "Wire up the subagents",
  summary: "Complete an Agent SDK configuration for the coordinator and two subagents.",
  brief: ["Fill each blank in the coordinator's configuration, then check. Consider what each agent needs and nothing more."],
  code: [
"from claude_agent_sdk import ClaudeAgentOptions, AgentDefinition",
"",
"options = ClaudeAgentOptions(",
"    system_prompt=COORDINATOR_PROMPT,",
"    allowed_tools=[{{0}}, \"Read\"],",
"    agents={",
"        \"web-searcher\": AgentDefinition(",
"            description={{1}},",
"            prompt=SEARCHER_PROMPT,",
"            tools={{2}},",
"        ),",
"        \"synthesizer\": AgentDefinition(",
"            description=\"Combines findings passed to it into a cited draft. Does no new research.\",",
"            prompt=SYNTH_PROMPT,",
"            tools={{3}},",
"        ),",
"    },",
")",
"",
"# what the coordinator passes into the synthesizer's prompt",
"synth_input = {{4}}"].join("\n"),
  blanks: [
    { opts: ["\"Task\"", "\"WebSearch\"", "\"Bash\""], a: 0, why: "The coordinator spawns subagents through the Task tool; without it in `allowed_tools` the subagents are unreachable." },
    { opts: ["\"Web researcher\"", "\"Finds and fetches current public sources for one subtopic. Returns claims with URL, title and publish date.\"", "\"You are a helpful assistant.\""], a: 1, why: "The coordinator routes on descriptions. Say when to use the agent and what it returns." },
    { opts: ["[\"WebSearch\", \"WebFetch\"]", "[\"WebSearch\", \"WebFetch\", \"Write\", \"Bash\"]", "None  # inherit every tool"], a: 0, why: "Scope tools to the role. A searcher has no reason to write files or run shell commands." },
    { opts: ["[\"mcp__facts__verify_fact\"]", "[\"WebSearch\", \"WebFetch\"]", "[\"Task\"]"], a: 0, why: "A narrow verify_fact tool covers the synthesizer's quick checks without letting it start new research. Open-ended research stays with the searcher." },
    { opts: ["json.dumps([{\"claim\": f.text, \"source_url\": f.url, \"title\": f.title, \"published\": f.date} for f in findings])", "\"\\n\".join(f.text for f in findings)", "\"Use the findings from earlier in this conversation.\""], a: 0, why: "Structured records keep content and metadata apart, so citations survive. Plain text drops the sources, and the subagent can't see earlier conversation at all." }
  ],
  takeaway: "Coordinator: Task tool plus little else. Subagents: a routing-quality description, a role-scoped tool list, and every piece of context they need passed explicitly." },

{ id: "1-7", d: 1, ts: "1.2", type: "order", mins: 5, title: "Sequence the refinement loop",
  summary: "Put the research coordinator's control flow in order.",
  brief: ["Arrange the coordinator's steps for a broad research request, from receiving the query to delivering the report."],
  items: [
    "Analyze the query and decide which subagents it actually needs",
    "Partition the scope into distinct subtopics or source types, one per searcher",
    "Spawn the searchers in parallel with several Task calls in one response",
    "Pass the complete findings, with source metadata, to the document analyst",
    "Have the synthesizer draft from the findings and analysis it is given",
    "Check the draft for coverage gaps and conflicting claims",
    "Re-delegate targeted queries for the gaps, then re-run synthesis",
    "Have the report writer format the final cited report"
  ],
  why: "Decide and partition before spawning; fan out in one response; pass context explicitly; and loop on gaps before formatting. The gap check (6) and targeted re-delegation (7) are what make it iterative refinement rather than a one-shot pipeline.",
  takeaway: "Iterative refinement means the coordinator evaluates the synthesis and goes back for what's missing. It does not mean re-running everything." },

/* =========================== DOMAIN 2 =========================== */
{ id: "2-1", d: 2, ts: "2.2", type: "classify", mins: 7, title: "Triage tool failures",
  summary: "Classify ten tool outcomes into the error category an agent can act on.",
  brief: ["Your MCP server is getting a structured error taxonomy. For each outcome, pick the category it should report. One bucket is for outcomes that aren't errors at all."],
  buckets: ["Transient", "Validation", "Business", "Permission", "Not an error"],
  items: [
    { t: "Warehouse API didn't answer within 10 seconds", a: 0, why: "Timeouts are transient: retryable, ideally with backoff, inside the subagent." },
    { t: "CRM returned HTTP 429 (rate limited)", a: 0, why: "Rate limits clear with time. Transient and retryable." },
    { t: "`order_id` \"ABC\" doesn't match the format `A-` plus six digits", a: 1, why: "The input is malformed. Retrying the same call won't help; the agent has to reformulate it." },
    { t: "Refund requested for an order delivered 140 days ago (policy allows 90)", a: 2, why: "A policy violation. Not retryable; the agent needs a customer-facing explanation, or escalates if an exception is requested." },
    { t: "Refund amount exceeds what remains refundable on the order", a: 2, why: "A business-state rule. Retrying can't change the remaining balance." },
    { t: "Service account lacks the `billing:write` scope", a: 3, why: "Permission failures need a different principal or a human, not a retry." },
    { t: "Order search by email succeeded and matched zero orders", a: 4, why: "A valid empty result. Reporting it as an error would hide a real finding: this customer has no orders under that email." },
    { t: "Upstream returned 503 Service Unavailable", a: 0, why: "Server-side unavailability is transient." },
    { t: "`since` parameter given as \"next tuesday\" instead of ISO 8601", a: 1, why: "Malformed input; the agent should reformat it." },
    { t: "The order belongs to a tenant the caller's credentials can't access", a: 3, why: "An authorization boundary, not a retryable condition." }
  ],
  takeaway: "The category decides the recovery: transient → retry locally; validation → fix the input; business → explain or escalate; permission → different principal. An empty result is an answer." },

{ id: "2-2", d: 2, ts: "2.2 · 5.3", type: "editor", lang: "json", mins: 15, title: "Write the MCP error payloads",
  summary: "Hand-write two tool results an agent can recover from. A validator checks each one.",
  brief: ["Both tools currently return `\"Operation failed\"`, and the agent tells customers their order doesn't exist. Rewrite each result as an MCP tool result with `isError`, a human-readable `content` text block, and a `structuredContent` object the agent can act on."],
  tasks: [
  { label: "lookup_order: one warehouse timed out",
    prompt: "`lookup_order` for `A-204918` queried three regional warehouses. US-East returned `{\"warehouse\":\"us-east\",\"status\":\"shipped\",\"qty\":1}`, APAC returned `{\"warehouse\":\"apac\",\"status\":\"backordered\",\"qty\":1}`, and EU-West timed out after 10 seconds.",
    starter: "{\n  \"content\": [\n    { \"type\": \"text\", \"text\": \"Operation failed\" }\n  ]\n}",
    solution: "{\n  \"isError\": true,\n  \"content\": [\n    { \"type\": \"text\", \"text\": \"EU-West warehouse timed out after 10s; US-East and APAC answered. Safe to retry EU-West.\" }\n  ],\n  \"structuredContent\": {\n    \"errorCategory\": \"transient\",\n    \"isRetryable\": true,\n    \"message\": \"EU-West warehouse did not respond within 10 seconds.\",\n    \"attemptedQuery\": { \"tool\": \"lookup_order\", \"order_id\": \"A-204918\", \"warehouses\": [\"us-east\", \"apac\", \"eu-west\"] },\n    \"partialResults\": [\n      { \"warehouse\": \"us-east\", \"status\": \"shipped\", \"qty\": 1 },\n      { \"warehouse\": \"apac\", \"status\": \"backordered\", \"qty\": 1 }\n    ],\n    \"failed\": [\"eu-west\"]\n  }\n}",
    check: "lookup" },
  { label: "process_refund: outside the return window",
    prompt: "`process_refund` for order `A-118842` was rejected: it was delivered on 2024-01-03 and the request came on 2024-06-02. Policy allows refunds within 90 days of delivery.",
    starter: "{\n  \"content\": [\n    { \"type\": \"text\", \"text\": \"Operation failed\" }\n  ]\n}",
    solution: "{\n  \"isError\": true,\n  \"content\": [\n    { \"type\": \"text\", \"text\": \"Refund rejected: order A-118842 was delivered 151 days ago; the policy allows 90 days.\" }\n  ],\n  \"structuredContent\": {\n    \"errorCategory\": \"business\",\n    \"isRetryable\": false,\n    \"rule\": \"refund_window_90_days\",\n    \"attemptedQuery\": { \"tool\": \"process_refund\", \"order_id\": \"A-118842\" },\n    \"customerMessage\": \"This order was delivered on January 3, more than 90 days ago, so it is outside our refund window. I can check whether an exception is possible.\"\n  }\n}",
    check: "refund" }
  ],
  takeaway: "An actionable error says what kind of failure it was, whether to retry, what was attempted, and what did succeed. Partial results let the agent answer with what it has instead of starting over." },

{ id: "2-3", d: 2, ts: "2.3", type: "classify", mins: 6, title: "Distribute the tools",
  summary: "Give each tool to exactly one agent in the research system.",
  brief: ["The research system has a coordinator and four subagents. Assign each tool to the one agent whose role needs it."],
  buckets: ["Coordinator", "Searcher", "Doc analyst", "Synthesizer", "Report writer"],
  items: [
    { t: "`Task`: spawn a subagent", a: 0, why: "Only the coordinator delegates. Keeping Task there enforces hub-and-spoke." },
    { t: "`update_research_plan`: read and write the coverage checklist", a: 0, why: "Tracking coverage and deciding what to re-delegate is the coordinator's job." },
    { t: "`web_search`", a: 1, why: "Open-ended discovery belongs to the searcher." },
    { t: "`fetch_url`", a: 1, why: "Retrieving pages the search turned up is part of the searcher's job." },
    { t: "`read_pdf`: read an uploaded document", a: 2, why: "The analyst works on the provided corpus." },
    { t: "`extract_tables`: pull tables out of a PDF page", a: 2, why: "Structured extraction from documents is analysis." },
    { t: "`verify_fact`: look up one claim against a trusted index", a: 3, why: "A narrow check for the synthesizer's common case, without handing it open-ended search." },
    { t: "`render_report`: lay out sections, tables and citations", a: 4, why: "Formatting is the report writer's only job." }
  ],
  takeaway: "Role-scoped toolsets keep selection reliable and stop agents drifting into each other's work. A narrow tool such as verify_fact is often better than a broad one." },

{ id: "2-4", d: 2, ts: "2.4", type: "fill", mins: 6, title: "Configure team MCP servers",
  summary: "Set up GitHub and Jira MCP servers so the whole team gets them and no secret is committed.",
  brief: ["The team wants every Claude Code session in this repo to have GitHub and Jira tools. Fill the blanks."],
  code: [
"$ claude mcp add --scope {{0}} github -- npx -y @modelcontextprotocol/server-github",
"",
"# Resulting file: {{1}}",
"{",
"  \"mcpServers\": {",
"    \"github\": {",
"      \"command\": \"npx\",",
"      \"args\": [\"-y\", \"@modelcontextprotocol/server-github\"],",
"      \"env\": { \"GITHUB_PERSONAL_ACCESS_TOKEN\": {{2}} }",
"    },",
"    \"jira\": {",
"      \"type\": {{3}},",
"      \"url\": \"https://mcp.jira.example.com/mcp\"",
"    }",
"  }",
"}"].join("\n"),
  blanks: [
    { opts: ["project", "user", "local"], a: 0, why: "Project scope writes the shared, committed config. User and local scope stay on one machine." },
    { opts: [".mcp.json at the repository root (committed)", "~/.claude.json (your home directory)", ".claude/settings.local.json (git-ignored)"], a: 0, why: "Project-scoped servers live in `.mcp.json` at the repo root, which is checked in." },
    { opts: ["\"${GITHUB_TOKEN}\"", "\"ghp_3fK9...\"  # the team bot's token", "\"\"  # each dev pastes theirs before running"], a: 0, why: "Environment expansion keeps the secret out of version control while the config stays shared. Each developer exports their own token." },
    { opts: ["\"http\"", "\"stdio\"", "\"websocket\""], a: 0, why: "A remote server reached by URL uses the HTTP transport. stdio is for local processes started by `command`." }
  ],
  takeaway: "Shared servers: project scope in `.mcp.json`, committed, with `${VAR}` expansion for secrets. Personal servers: user scope." },

{ id: "2-5", d: 2, ts: "2.5", type: "classify", mins: 5, title: "Pick the built-in tool",
  summary: "Nine developer-productivity tasks; choose the tool an Agent SDK agent should reach for.",
  brief: ["The developer-productivity agent has Read, Write, Edit, Bash, Grep and Glob. Choose the best first tool for each task."],
  buckets: ["Grep", "Glob", "Read", "Edit", "Write", "Bash"],
  items: [
    { t: "Find every file that calls `legacyAuth(`", a: 0, why: "Content search is Grep's job." },
    { t: "List every `*.config.ts` under `packages/`", a: 1, why: "Matching paths by pattern is Glob's job." },
    { t: "Understand what `billing/invoice.ts` does before changing it", a: 2, why: "Read the file you're about to change." },
    { t: "Change a timeout constant on one line whose text is unique in the file", a: 3, why: "A targeted change with a unique anchor is what Edit is for." },
    { t: "Create a new `docs/ADR-014.md`", a: 4, why: "Creating a file is a Write." },
    { t: "Run the test suite to confirm the fix", a: 5, why: "Executing commands is Bash." },
    { t: "Edit failed because `return null;` appears 14 times; you've read the file and want to apply the full revision", a: 4, why: "When no unique anchor exists, Read the file and Write the complete new version." },
    { t: "Find which files import from `@acme/ui`", a: 0, why: "Searching import statements is a content search." },
    { t: "Locate all `*.spec.ts` files to see how tests are organised", a: 1, why: "Discovering files by name pattern is Glob." }
  ],
  takeaway: "Map with Glob and Grep, Read what matters, Edit with unique anchors, and fall back to Read + Write when an anchor can't be made unique." },

/* =========================== DOMAIN 3 =========================== */
{ id: "3-1", d: 3, ts: "3.1 · 3.2 · 3.3", type: "classify", mins: 8, title: "Where does this belong?",
  summary: "Route ten pieces of configuration to the right layer of Claude Code.",
  brief: ["Each item is something a developer wants Claude Code to know or do. Pick the place it belongs."],
  buckets: ["~/.claude/CLAUDE.md", "Project CLAUDE.md", "Subfolder CLAUDE.md", ".claude/rules/ + paths", "Skill or command", "Hook"],
  items: [
    { t: "\"I prefer terse answers and British spelling.\"", a: 0, why: "A personal preference. User scope follows you everywhere and doesn't impose on teammates." },
    { t: "\"Use pnpm, never npm. Run `pnpm test` before committing.\"", a: 1, why: "A team-wide convention: project CLAUDE.md, committed." },
    { t: "`packages/legacy-php/` has its own build commands and style; nothing outside that folder should see them", a: 2, why: "Folder-local guidance belongs in that folder's CLAUDE.md, which loads when Claude works there." },
    { t: "React test files anywhere in the repo (`**/*.test.tsx`) must query by role", a: 3, why: "A convention that cuts across folders by file type. Path-scoped rules load only for matching files." },
    { t: "Terraform files (`**/*.tf`) must pin provider versions", a: 3, why: "Another file-type convention spread across the tree." },
    { t: "A `/release-notes` workflow the team runs before each release", a: 4, why: "An on-demand workflow is a project skill or command, shared through the repo." },
    { t: "Run prettier on every file Claude edits, without exception", a: 5, why: "\"Without exception\" means a hook. Instructions in CLAUDE.md can be missed; a PostToolUse hook can't." },
    { t: "Block any edit to `.env` files", a: 5, why: "Guaranteed enforcement: a PreToolUse hook that denies the call." },
    { t: "Architecture overview: services, data flow, where things live", a: 1, why: "Context every teammate's session needs, shared through the project file." },
    { t: "A security checklist the team invokes on demand with a package name", a: 4, why: "On demand, with an argument: a skill (with `argument-hint`) or a command." }
  ],
  takeaway: "Ask two questions. Who should it reach (you, the team, one folder, one file type)? Must it happen every time (hook) or on request (skill or command)?" },

{ id: "3-2", d: 3, ts: "3.3", type: "editor", lang: "markdown", mins: 10, title: "Write a path-scoped rule",
  summary: "Author `.claude/rules/testing.md` and test its globs against real repo paths.",
  brief: ["Test conventions are currently copied into 40 folders. Replace them with one rule file that loads for every TypeScript test file (`*.test.ts` and `*.test.tsx`) anywhere in the repo, including the root, and for nothing else: not source files, Storybook stories, Playwright `*.spec.ts` files, or docs."],
  tasks: [
  { label: ".claude/rules/testing.md",
    prompt: "Fix the frontmatter's `paths` globs. The checker runs them against the paths in the table.",
    starter: "---\npaths: [\"src/*.test.ts\"]\n---\n# Test conventions\n- Query elements by role, not by test ID\n- One behaviour per test; name tests \"does X when Y\"\n",
    solution: "---\npaths:\n  - \"**/*.test.ts\"\n  - \"**/*.test.tsx\"\n---\n# Test conventions\n- Query elements by role, not by test ID\n- One behaviour per test; name tests \"does X when Y\"\n",
    check: "rules" }
  ],
  takeaway: "`**/` matches zero or more folders, so `**/*.test.ts` also catches a root-level `setup.test.ts`. Rules cost context only when matching files are in play." },

{ id: "3-3", d: 3, ts: "3.6", type: "fill", mins: 8, title: "Assemble the CI review job",
  summary: "Complete a GitHub Actions step that runs Claude Code headless and posts inline findings.",
  brief: ["The pipeline generates tests in one step and reviews the PR in another. Fill the blanks so the review runs unattended, returns machine-readable findings, stays independent, and doesn't repeat itself."],
  code: [
"- name: Claude review",
"  run: |",
"    # Review runs in {{0}}",
"    # prior-findings.json holds {{1}}",
"    claude {{2}} \"Review pr.diff against the criteria in CLAUDE.md.",
"      Report only issues that are not already in prior-findings.json,",
"      or that are listed there but still unaddressed.\" \\",
"      {{3}} \\",
"      --json-schema \"$(cat .github/review-finding.schema.json)\" \\",
"      > review.json",
"",
"- name: Post inline comments",
"  run: node scripts/post-comments.js review.json"].join("\n"),
  blanks: [
    { opts: ["a fresh session, independent of the generation step", "the generation step's session (--continue) so it knows why the code was written", "the generation step's session with an extra \"be critical\" instruction"], a: 0, why: "The session that generated the code keeps its own reasoning and is a weak reviewer of it. An independent instance reviews the diff on its merits." },
    { opts: ["the findings this bot already posted on earlier pushes to this PR", "every finding the bot has ever made across all repositories", "nothing; it is emptied on each run to avoid bias"], a: 0, why: "Prior findings for this PR let the reviewer skip what it already reported, so pushes don't produce duplicate comments." },
    { opts: ["-p", "--resume", "--verbose"], a: 0, why: "`-p` (print mode) runs non-interactively and exits, so the job never waits for input." },
    { opts: ["--output-format json", "--output-format text", "--max-turns 1"], a: 0, why: "JSON output, validated against the schema, gives the posting script file, line, severity and message fields instead of prose to regex." }
  ],
  takeaway: "Headless with `-p`, structured with `--output-format json` plus `--json-schema`, independent of the author session, and fed its own prior findings." },

{ id: "3-4", d: 3, ts: "3.4", type: "classify", mins: 5, title: "Plan mode or direct?",
  summary: "Choose how Claude Code should approach eight tasks.",
  brief: ["For each request, pick the approach that fits."],
  buckets: ["Plan mode first", "Direct execution", "Explore subagent first"],
  items: [
    { t: "Fix a typo in one error message", a: 1, why: "Small, obvious, single-file. Planning adds nothing." },
    { t: "Migrate 120 files from moment.js to date-fns; an adapter layer and a direct rewrite are both viable", a: 0, why: "Many files and two credible strategies. Agree the plan before touching code." },
    { t: "Add the missing null check where the stack trace points to the exact line", a: 1, why: "The fix is clear and local." },
    { t: "Split the billing module out of the monolith into its own service", a: 0, why: "An architectural change with many dependencies and trade-offs." },
    { t: "\"How does auth flow through this unfamiliar 300-file codebase?\" before deciding anything", a: 2, why: "Verbose discovery. The Explore subagent reads widely and returns a summary, keeping the main context clean." },
    { t: "Rename a helper used in three files that are covered by tests", a: 1, why: "Well-scoped, and the tests catch mistakes." },
    { t: "Choose between Redis and Postgres for a new job queue", a: 0, why: "Several valid designs. Explore and compare before committing." },
    { t: "Find every place a deprecated config flag is read across a large repo, without flooding the session", a: 2, why: "Broad, read-heavy search whose details you don't need in the main conversation." }
  ],
  takeaway: "Plan when scope or approach is uncertain, act directly when the fix is obvious, and push verbose discovery into a subagent." },

{ id: "3-5", d: 3, ts: "3.2", type: "fill", mins: 6, title: "Write the skill frontmatter",
  summary: "Configure a dependency-audit skill that is safe, discoverable, and keeps its noise out of the session.",
  brief: ["The audit reads lockfiles and runs `npm outdated`, producing hundreds of lines. It must never modify files. Fill the blanks."],
  code: [
"# saved as {{0}}",
"---",
"name: dependency-audit",
"description: {{1}}",
"argument-hint: {{2}}",
"allowed-tools: {{3}}",
"context: {{4}}",
"---",
"Audit the dependencies of the package named in $ARGUMENTS.",
"Report outdated, vulnerable, and unused packages as a table with a recommended action for each."].join("\n"),
  blanks: [
    { opts: [".claude/skills/dependency-audit/SKILL.md", "~/.claude/CLAUDE.md", ".claude/rules/dependency-audit.md"], a: 0, why: "Project skills live in `.claude/skills/<name>/SKILL.md` and ship with the repo." },
    { opts: ["Audits a package's dependencies for outdated, vulnerable or unused packages. Use when asked to audit, upgrade or review dependencies.", "Dependency stuff", "You are a world-class dependency expert."], a: 0, why: "The description tells Claude when to use the skill. Say what it does and the requests that should trigger it." },
    { opts: ["\"<package-name>\"", "\"--verbose\"", "true"], a: 0, why: "`argument-hint` shows users what to pass after the command." },
    { opts: ["Read, Grep, Glob, Bash(npm outdated:*)", "*", "Write, Edit"], a: 0, why: "Restrict the skill to read-only tools plus the one command it needs. That's a guarantee; \"don't modify files\" in the body is only a request." },
    { opts: ["fork", "inherit", "shared"], a: 0, why: "`context: fork` runs the skill in an isolated subagent context, so hundreds of lines of audit output don't land in the main conversation; only the result comes back." }
  ],
  takeaway: "Skills combine a routing description, an argument hint, an `allowed-tools` restriction, and `context: fork` when the work is noisy." },

/* =========================== DOMAIN 4 =========================== */
{ id: "4-1", d: 4, ts: "4.3 · 4.4", type: "editor", lang: "json", mins: 15, title: "Schema surgeon",
  summary: "Repair an invoice-extraction schema that forces the model to invent data.",
  brief: ["Validation findings from 2,000 invoices: 31% have no PO number and the model invented one in every case. 12% have no due date. Payment terms such as \"NET45\" or \"2/10 NET30\" were coerced into the nearest enum value. And 4% of invoices had line items that didn't add up to the stated total, which nobody noticed downstream.",
          "Edit the schema so absence, unexpected values and arithmetic conflicts can all be expressed. Keep it strict-mode friendly: every property is listed in `required`, and absence is expressed with `null`."],
  tasks: [
  { label: "invoice.schema.json",
    prompt: "Fix the schema, then run the checks.",
    starter: "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"invoice_number\": { \"type\": \"string\" },\n    \"vendor_name\": { \"type\": \"string\" },\n    \"po_number\": { \"type\": \"string\", \"description\": \"Purchase order number\" },\n    \"due_date\": { \"type\": \"string\", \"description\": \"YYYY-MM-DD\" },\n    \"payment_terms\": { \"type\": \"string\", \"enum\": [\"NET30\", \"NET60\", \"DUE_ON_RECEIPT\"] },\n    \"line_items\": {\n      \"type\": \"array\",\n      \"items\": {\n        \"type\": \"object\",\n        \"properties\": {\n          \"description\": { \"type\": \"string\" },\n          \"amount\": { \"type\": \"number\" }\n        },\n        \"required\": [\"description\", \"amount\"],\n        \"additionalProperties\": false\n      }\n    },\n    \"stated_total\": { \"type\": \"number\" }\n  },\n  \"required\": [\"invoice_number\", \"vendor_name\", \"po_number\", \"due_date\", \"payment_terms\", \"line_items\", \"stated_total\"]\n}",
    solution: "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"invoice_number\": { \"type\": \"string\" },\n    \"vendor_name\": { \"type\": \"string\" },\n    \"po_number\": { \"type\": [\"string\", \"null\"], \"description\": \"Purchase order number, or null if the invoice has none\" },\n    \"due_date\": { \"type\": [\"string\", \"null\"], \"description\": \"YYYY-MM-DD, or null if not stated\" },\n    \"payment_terms\": { \"type\": \"string\", \"enum\": [\"NET30\", \"NET60\", \"DUE_ON_RECEIPT\", \"other\", \"unclear\"] },\n    \"payment_terms_detail\": { \"type\": [\"string\", \"null\"], \"description\": \"Verbatim terms when payment_terms is other or unclear\" },\n    \"line_items\": {\n      \"type\": \"array\",\n      \"items\": {\n        \"type\": \"object\",\n        \"properties\": {\n          \"description\": { \"type\": \"string\" },\n          \"amount\": { \"type\": \"number\" }\n        },\n        \"required\": [\"description\", \"amount\"],\n        \"additionalProperties\": false\n      }\n    },\n    \"stated_total\": { \"type\": \"number\" },\n    \"calculated_total\": { \"type\": \"number\", \"description\": \"Sum of line_items amounts\" },\n    \"conflict_detected\": { \"type\": \"boolean\", \"description\": \"true when calculated_total differs from stated_total\" }\n  },\n  \"required\": [\"invoice_number\", \"vendor_name\", \"po_number\", \"due_date\", \"payment_terms\", \"payment_terms_detail\", \"line_items\", \"stated_total\", \"calculated_total\", \"conflict_detected\"],\n  \"additionalProperties\": false\n}",
    check: "schema" }
  ],
  takeaway: "A schema guarantees shape, not truth. Give the model honest ways to say \"absent\", \"something else\" and \"this doesn't add up\", then route those cases instead of discovering them downstream." },

{ id: "4-2", d: 4, ts: "4.1", type: "classify", mins: 6, title: "Tighten the review prompt",
  summary: "Keep the lines that raise precision; cut the ones that generate false positives.",
  brief: ["Developers ignore the CI reviewer because 40% of its comments are noise. Here are the lines of its current prompt. Keep or cut each one."],
  buckets: ["Keep", "Cut"],
  items: [
    { t: "\"Report: SQL built by string concatenation with request data; unchecked null dereferences on values from external APIs; new endpoints without an auth check.\"", a: 0, why: "Explicit categories tell the model exactly what counts." },
    { t: "\"Be conservative and only flag things you're confident about.\"", a: 1, why: "Vague. It doesn't define what to report, so precision doesn't move." },
    { t: "\"Don't comment on formatting, naming or import order. Linters own those.\"", a: 0, why: "An explicit exclusion removes a whole class of noise." },
    { t: "\"HIGH = exploitable or data-losing, e.g. `db.query('SELECT ... ' + req.query.id)`. MEDIUM = wrong result on an edge case, e.g. an off-by-one in pagination.\"", a: 0, why: "Severity levels anchored to concrete code make labels consistent." },
    { t: "\"Try to find as many issues as possible.\"", a: 1, why: "This pushes recall at the cost of precision, which is the opposite of what developers need." },
    { t: "\"Skip anything under `/gen`; that code is generated (see CLAUDE.md).\"", a: 0, why: "A concrete exception tied to the project's documented standards." },
    { t: "\"IMPORTANT!!! NEVER MISS A BUG!!!\"", a: 1, why: "Emphatic pressure makes current models over-flag. State the criteria instead." },
    { t: "\"For each finding give file, line, category, severity, and a one-sentence fix.\"", a: 0, why: "A defined output shape makes every finding actionable and parseable." },
    { t: "\"Flag anything that looks unusual.\"", a: 1, why: "Unbounded. \"Unusual\" covers most intentional code." }
  ],
  takeaway: "Precision comes from defining what to report, what to skip, and what each severity looks like in code, not from telling the model to be careful." },

{ id: "4-3", d: 4, ts: "4.4", type: "code", mins: 15, title: "Retry with error feedback",
  summary: "Implement a bounded validation-retry loop that knows when retrying is pointless.",
  brief: ["The extraction pipeline currently calls the model once and passes whatever comes back downstream. Implement `extractWithRetry` so validation errors are fed back to the model, with a hard limit on attempts."],
  spec: ["At most 3 model calls.",
         "If the output isn't valid JSON, treat it as a validation failure whose error message says the output was not valid JSON.",
         "On a failure, append the model's previous output as an `assistant` message, then a `user` message quoting the specific error, and call again.",
         "If `validate` returns `retryable: false`, the information isn't in the document; stop at once.",
         "Return `{ ok, data, attempts }`, where `attempts` is the number of model calls made."],
  fn: "extractWithRetry",
  starter: [
"// callModel(messages) -> string          (the model's JSON text)",
"// validate(obj)       -> { ok: true }",
"//                     or { ok: false, error: \"due_date: expected YYYY-MM-DD\", retryable: true | false }",
"function extractWithRetry(callModel, docText, validate) {",
"  const messages = [{ role: \"user\", content: \"Extract the invoice fields as JSON.\\n\\n\" + docText }];",
"  const raw = callModel(messages);",
"  const data = JSON.parse(raw);",
"  return { ok: validate(data).ok, data: data, attempts: 1 };",
"}"].join("\n"),
  solution: [
"function extractWithRetry(callModel, docText, validate) {",
"  const messages = [{ role: \"user\", content: \"Extract the invoice fields as JSON.\\n\\n\" + docText }];",
"  let last = null;",
"",
"  for (let attempt = 1; attempt <= 3; attempt++) {",
"    const raw = callModel(messages);",
"    let data = null, verdict;",
"    try {",
"      data = JSON.parse(raw);",
"      verdict = validate(data);",
"    } catch (e) {",
"      verdict = { ok: false, error: \"Output was not valid JSON: \" + e.message, retryable: true };",
"    }",
"    if (verdict.ok) return { ok: true, data: data, attempts: attempt };",
"",
"    last = { ok: false, data: data, attempts: attempt, error: verdict.error };",
"    if (verdict.retryable === false) return last;   // the source lacks it; retrying can't help",
"",
"    messages.push({ role: \"assistant\", content: raw });",
"    messages.push({ role: \"user\", content: \"That output failed validation: \" + verdict.error +",
"                                          \". Return corrected JSON only.\" });",
"  }",
"  return last;",
"}"].join("\n"),
  harness: function harness() {
    function model(outputs) {
      var m = { calls: 0, seen: [] };
      m.fn = function (messages) {
        m.seen.push(JSON.parse(JSON.stringify(messages)));
        m.calls++;
        if (m.calls > 6) throw new Error("MOCK_BUDGET: called the model more than 6 times");
        return outputs[Math.min(m.calls, outputs.length) - 1];
      };
      return m;
    }
    function v(obj) {
      if (obj.due_date === undefined) return { ok: false, error: "due_date: missing", retryable: true };
      if (obj.due_date === "ABSENT") return { ok: false, error: "po_number: not present in document", retryable: false };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(obj.due_date)) return { ok: false, error: "due_date: expected YYYY-MM-DD", retryable: true };
      return { ok: true };
    }
    var good = "{\"due_date\":\"2024-06-30\"}", bad = "{\"due_date\":\"30/06/24\"}";
    check("Succeeds on the first try without extra calls", function () {
      var m = model([good]); var r = extractWithRetry(m.fn, "INV-1", v);
      return (r && r.ok === true && r.attempts === 1 && m.calls === 1) || ("Got " + JSON.stringify(r) + " after " + m.calls + " call(s).");
    });
    check("Feeds the specific error back, after the previous output", function () {
      var m = model([bad, good]); var r = extractWithRetry(m.fn, "INV-2", v);
      if (!(r && r.ok === true && r.attempts === 2)) return "Expected ok after 2 attempts; got " + JSON.stringify(r);
      var msgs = m.seen[1], u = msgs[msgs.length - 1], a = msgs[msgs.length - 2];
      if (!a || a.role !== "assistant" || a.content !== bad) return "The second call should include the previous output as an assistant message.";
      return (u.role === "user" && u.content.indexOf("expected YYYY-MM-DD") >= 0) || "The last user message should quote the validation error.";
    });
    check("Treats unparseable output as a retryable failure", function () {
      var m = model(["Sure! Here is the JSON: {due_date: 2024-06-30}", good]); var r = extractWithRetry(m.fn, "INV-3", v);
      if (!(r && r.ok === true && r.attempts === 2)) return "Expected recovery on attempt 2; got " + JSON.stringify(r);
      var u = m.seen[1][m.seen[1].length - 1];
      return /JSON/.test(u.content) || "Tell the model its output was not valid JSON.";
    });
    check("Gives up after 3 attempts", function () {
      var m = model([bad, bad, bad, bad, bad]); var r = extractWithRetry(m.fn, "INV-4", v);
      return (r && r.ok === false && r.attempts === 3 && m.calls === 3) || ("Got " + JSON.stringify(r) + " after " + m.calls + " call(s).");
    });
    check("Stops immediately when the information isn't in the document", function () {
      var m = model(["{\"due_date\":\"ABSENT\"}", good]); var r = extractWithRetry(m.fn, "INV-5", v);
      return (r && r.ok === false && m.calls === 1) || ("Made " + m.calls + " call(s); retrying can't add information the source lacks.");
    });
    check("Keeps the original document message first on every call", function () {
      var m = model([bad, bad, good]); extractWithRetry(m.fn, "INV-6 body", v);
      var allOk = m.seen.every(function (s) { return s[0] && s[0].role === "user" && String(s[0].content).indexOf("INV-6 body") >= 0; });
      return allOk || "Every call should start with the original user message containing the document.";
    });
  },
  takeaway: "Retry with the error, not the same prompt; bound the attempts; and recognise the failures no retry can fix." },

{ id: "4-4", d: 4, ts: "4.5", type: "code", mins: 12, title: "Reconcile a message batch",
  summary: "Match out-of-order batch results by custom_id and decide what to resubmit.",
  brief: ["The nightly extraction batch's results came back. The current code assumes results arrive in input order and that everything succeeded. Rewrite `reconcile`."],
  spec: ["Results arrive in any order, and a result may be missing entirely.",
         "`texts`: `custom_id` → text of the first content block, for succeeded results only.",
         "`resubmit`: expired, canceled, `api_error` or `overloaded_error` results, plus inputs with no result at all.",
         "`needsFix`: `invalid_request_error` results; resubmitting them unchanged would fail again.",
         "Sort `resubmit` and `needsFix` alphabetically."],
  fn: "reconcile",
  starter: [
"// inputs : [{ custom_id: \"doc-0001\", params: {...} }, ...]",
"// results: [{ custom_id, result: { type: \"succeeded\", message: { content: [{ type: \"text\", text }] } } }",
"//          | { custom_id, result: { type: \"errored\", error: { type: \"invalid_request_error\" | \"api_error\" | \"overloaded_error\" } } }",
"//          | { custom_id, result: { type: \"expired\" } }",
"//          | { custom_id, result: { type: \"canceled\" } }]",
"// Return { texts: { [custom_id]: text }, resubmit: [custom_id, ...], needsFix: [custom_id, ...] }",
"function reconcile(inputs, results) {",
"  const texts = {};",
"  for (let i = 0; i < inputs.length; i++) {",
"    texts[inputs[i].custom_id] = results[i].result.message.content[0].text;",
"  }",
"  return { texts: texts, resubmit: [], needsFix: [] };",
"}"].join("\n"),
  solution: [
"function reconcile(inputs, results) {",
"  const byId = {};",
"  for (const r of results) byId[r.custom_id] = r.result;",
"",
"  const texts = {}, resubmit = [], needsFix = [];",
"  for (const input of inputs) {",
"    const id = input.custom_id, res = byId[id];",
"    if (!res) { resubmit.push(id); continue; }",
"    if (res.type === \"succeeded\") { texts[id] = res.message.content[0].text; continue; }",
"    if (res.type === \"errored\" && res.error && res.error.type === \"invalid_request_error\") {",
"      needsFix.push(id); continue;",
"    }",
"    resubmit.push(id);  // expired, canceled, api_error, overloaded_error",
"  }",
"  return { texts: texts, resubmit: resubmit.sort(), needsFix: needsFix.sort() };",
"}"].join("\n"),
  harness: function harness() {
    function ok(id, t) { return { custom_id: id, result: { type: "succeeded", message: { content: [{ type: "text", text: t }] } } }; }
    function er(id, t) { return { custom_id: id, result: { type: "errored", error: { type: t } } }; }
    function ex(id) { return { custom_id: id, result: { type: "expired" } }; }
    function cn(id) { return { custom_id: id, result: { type: "canceled" } }; }
    var ids = ["doc-01", "doc-02", "doc-03", "doc-04", "doc-05", "doc-06", "doc-07"];
    var inputs = ids.map(function (id) { return { custom_id: id, params: {} }; });
    var results = [er("doc-05", "invalid_request_error"), ok("doc-03", "C"), ex("doc-02"), ok("doc-01", "A"), er("doc-06", "overloaded_error"), cn("doc-07")];
    function run() { return reconcile(inputs, JSON.parse(JSON.stringify(results))); }
    check("Matches results by custom_id, not position", function () {
      var r = run(); return (r && r.texts && r.texts["doc-01"] === "A" && r.texts["doc-03"] === "C") || ("texts = " + JSON.stringify(r && r.texts));
    });
    check("Only succeeded results appear in texts", function () {
      var r = run(); var keys = Object.keys((r && r.texts) || {}).sort();
      return JSON.stringify(keys) === JSON.stringify(["doc-01", "doc-03"]) || ("texts has keys " + JSON.stringify(keys));
    });
    check("Resubmits expired, canceled and overloaded results", function () {
      var r = run(); var s = (r && r.resubmit) || [];
      return (s.indexOf("doc-02") >= 0 && s.indexOf("doc-06") >= 0 && s.indexOf("doc-07") >= 0) || ("resubmit = " + JSON.stringify(s));
    });
    check("Resubmits inputs whose result never arrived", function () {
      var r = run(); return ((r && r.resubmit) || []).indexOf("doc-04") >= 0 || ("doc-04 has no result and should be resubmitted; resubmit = " + JSON.stringify(r && r.resubmit));
    });
    check("Sends invalid requests to needsFix, not resubmit", function () {
      var r = run(); var n = (r && r.needsFix) || [], s = (r && r.resubmit) || [];
      return (n.length === 1 && n[0] === "doc-05" && s.indexOf("doc-05") < 0) || ("needsFix = " + JSON.stringify(n));
    });
    check("Returns sorted lists", function () {
      var r = run(); return JSON.stringify(r && r.resubmit) === JSON.stringify(["doc-02", "doc-04", "doc-06", "doc-07"]) || ("resubmit = " + JSON.stringify(r && r.resubmit));
    });
  },
  takeaway: "Key everything by `custom_id`, assume nothing about order or completeness, and resubmit only what can succeed unchanged." },

{ id: "4-5", d: 4, ts: "4.5", type: "classify", mins: 5, title: "Batch or synchronous?",
  summary: "Decide which workloads belong on the Message Batches API.",
  brief: ["Batches cost half as much, but results can take up to 24 hours and there's no latency guarantee. Sort these workloads."],
  buckets: ["Message Batches", "Synchronous API"],
  items: [
    { t: "Nightly re-extraction of 200,000 archived invoices", a: 0, why: "Large, offline, and nothing waits on it." },
    { t: "Pre-merge review that blocks the PR until it passes", a: 1, why: "A developer is waiting. Up to 24 hours with no SLA is unacceptable for a blocking check." },
    { t: "Weekly codebase-wide tech-debt report", a: 0, why: "Scheduled and tolerant of delay." },
    { t: "Support agent answering a live customer through a tool loop", a: 1, why: "Interactive and multi-turn." },
    { t: "Backfilling summaries for three years of closed tickets", a: 0, why: "A one-off bulk job." },
    { t: "Monthly eval run over 5,000 test prompts", a: 0, why: "A classic batch workload; results by morning are fine." },
    { t: "Generating a reply while the user watches a spinner", a: 1, why: "Latency-sensitive by definition." },
    { t: "Per-document workflow that needs several rounds of client-side tool calls", a: 1, why: "Each batch request is a single Messages call; your tools can't run mid-request. A multi-turn tool loop needs a round trip per turn." }
  ],
  takeaway: "Batch what nobody is waiting for. Keep anything blocking, interactive, or tool-looping on the synchronous API." },

{ id: "4-6", d: 4, ts: "4.2 · 4.6", type: "classify", mins: 6, title: "Match the fix to the failure",
  summary: "Seven review and extraction failures; pick the technique that addresses each.",
  brief: ["Each symptom comes from the CI reviewer or the extraction pipeline. Choose the change that fixes it most directly."],
  buckets: ["Few-shot examples", "Independent reviewer", "Per-file + integration passes", "Explicit criteria"],
  items: [
    { t: "The reviewer judges intentional `switch` fall-through inconsistently: sometimes flagged, sometimes not", a: 0, why: "An ambiguous pattern. Two to four examples showing when it's fine and when it's a bug, with reasons, settle it." },
    { t: "The session that generated the code reviews it and approves everything", a: 1, why: "It keeps its own reasoning. A separate instance reviews without that bias." },
    { t: "A 40-file PR review misses that a renamed function is still called from another file", a: 2, why: "Cross-file issues need a dedicated integration pass after the per-file passes." },
    { t: "Extraction from letters (prose) misses fields that it gets right on tabular invoices", a: 0, why: "Show examples in the formats you actually receive, including absent fields as null." },
    { t: "\"Be careful\" didn't reduce the nitpicks", a: 3, why: "Define what to report and what to skip." },
    { t: "Review depth drops for files late in a very large PR", a: 2, why: "Per-file passes give each file the same attention." },
    { t: "Severity labels drift between runs on the same code", a: 3, why: "Define each level, anchored by concrete code examples." }
  ],
  takeaway: "Ambiguity calls for examples, bias for independence, scale for multiple passes, and vagueness for criteria." },

/* =========================== DOMAIN 5 =========================== */
{ id: "5-1", d: 5, ts: "5.2", type: "classify", mins: 7, title: "Escalate, resolve, or ask?",
  summary: "Nine support situations; choose the right move for each.",
  brief: ["The support agent targets 80%+ first-contact resolution, and it must still escalate at the right moments. Decide each case."],
  buckets: ["Escalate now", "Resolve", "Ask a clarifying question"],
  items: [
    { t: "\"I've asked twice. Get me a human.\" The question itself is a simple tracking lookup.", a: 0, why: "An explicit request for a human is honoured immediately, with a handoff summary, not after one more attempt." },
    { t: "Furious, ALL-CAPS message about a late package; a standard re-ship within policy fixes it", a: 1, why: "Negative sentiment isn't complexity. The case is routine." },
    { t: "`get_customer` returns three accounts named Maria Lopez", a: 2, why: "Ask for an identifier (email, order number, postcode). Picking one by heuristic risks acting on the wrong account." },
    { t: "Refund requested for a custom-engraved item; the policy says nothing about personalised goods", a: 0, why: "A policy gap. The agent shouldn't invent policy." },
    { t: "Billing dispute: three different lookups can't find the charge in any system", a: 0, why: "No meaningful progress is possible with the tools available." },
    { t: "Address change; every check passes, but the model's self-reported confidence is 0.55", a: 1, why: "Uncalibrated self-confidence is a poor escalation signal. The case is routine and verified." },
    { t: "\"Cancel my order.\" The account has two open orders.", a: 2, why: "Ambiguous target. Ask which order before acting." },
    { t: "Return within 30 days, item unused, receipt verified", a: 1, why: "Squarely inside policy." },
    { t: "Wants a refund 10 days past the 30-day window because they were in hospital", a: 0, why: "A request for a policy exception needs a human decision." }
  ],
  takeaway: "Escalate on explicit request, policy exception or gap, or no progress. Ask when the target is ambiguous. Sentiment and self-rated confidence don't decide it." },

{ id: "5-2", d: 5, ts: "5.1", type: "classify", mins: 6, title: "Build the case-facts block",
  summary: "Choose what to pin verbatim and what a summary may compress, in a 60-turn conversation.",
  brief: ["The conversation is long enough that earlier turns are being summarized. A persistent case-facts block is re-sent with every request and is never summarized. Decide what goes in it."],
  buckets: ["Pin in case facts", "Let it summarize"],
  items: [
    { t: "Order `A-204918`, $1,284.00, delivered 2024-05-28", a: 0, why: "Exact IDs, amounts and dates are what summaries round off or drop." },
    { t: "The customer said they're \"really annoyed about this whole thing\"", a: 1, why: "Tone can be summarized; it isn't a fact the agent will act on precisely." },
    { t: "The agent promised a callback by Friday 5 pm ET", a: 0, why: "A commitment. Losing it breaks trust." },
    { t: "Partial refund already issued: $312.50 on 2024-06-01", a: 0, why: "Prevents a double refund. Exact amount and date matter." },
    { t: "A long story about the holiday the order was meant for", a: 1, why: "Context, not a fact the resolution depends on." },
    { t: "Customer verified as `C-88213` via email + postcode", a: 0, why: "The verification state gates refunds. Pin it." },
    { t: "Greetings and apologies from earlier turns", a: 1, why: "No information value." },
    { t: "Tracking number `1Z999AA10123456784`", a: 0, why: "An identifier the agent will reuse verbatim." },
    { t: "Three failed lookups before the order was found (now resolved)", a: 1, why: "Resolved history; the result is already pinned." },
    { t: "Customer prefers email over phone for follow-up", a: 0, why: "A constraint on how the case is handled." }
  ],
  takeaway: "Summaries are lossy where precision matters most. Pin identifiers, amounts, dates, commitments and constraints; let narrative compress." },

{ id: "5-3", d: 5, ts: "5.3", type: "defect", mins: 10, title: "Code review: error propagation",
  summary: "Four snippets where failures get lost between agents. Find the faulty lines.",
  brief: ["The research system's final report claimed \"no published studies\" on a topic that has plenty. Each snippet contributed. Select the lines responsible."],
  rounds: [
  { title: "Searcher subagent",
    code: [
"def search_subtopic(query):",
"    try:",
"        return web_search(query)",
"    except TimeoutError:",
"        return []  # nothing found"],
    bad: [4],
    why: "A timeout reported as an empty success is exactly how \"no studies found\" ends up in the report. Failure and absence are different findings.",
    fix: "return {\"isError\": True, \"errorCategory\": \"transient\", \"isRetryable\": True, \"attemptedQuery\": query, \"partialResults\": []}" },
  { title: "Coordinator collecting results",
    code: [
"results = []",
"for q in queries:",
"    r = run_searcher(q)",
"    if r.is_error:",
"        raise RuntimeError(\"Search failed, aborting research\")",
"    results.append(r)"],
    bad: [4],
    why: "One failed branch shouldn't abort the whole run. Record the failure, try an alternative or retry, and carry on with partial coverage.",
    fix: "    if r.is_error: failures.append(r); continue   # retry or re-delegate later" },
  { title: "Searcher's error path",
    code: [
"except Exception as e:",
"    logger.warning(\"search failed: %s\", e)",
"    return {\"status\": \"error\", \"message\": \"search unavailable\"}"],
    bad: [2],
    why: "A generic message hides what the coordinator needs to decide: the failure type, the query attempted, partial results, and possible alternatives.",
    fix: "return {\"isError\": True, \"errorCategory\": classify(e), \"attemptedQuery\": q, \"partialResults\": got, \"alternatives\": [\"scholar index\"]}" },
  { title: "Building the synthesis prompt",
    code: [
"findings = [r for r in results if not r.is_error]   # drop failed searches",
"brief = build_synthesis_brief(goal, findings)",
"draft = run_subagent(\"synthesizer\", brief)"],
    bad: [0],
    why: "The synthesizer needs to know what couldn't be researched, so it annotates coverage gaps instead of presenting absence as a finding.",
    fix: "brief = build_synthesis_brief(goal, findings, coverage={\"failed\": [r.query for r in results if r.is_error]})" }
  ],
  takeaway: "Failures travel as structured data all the way to the synthesizer. Nothing is silently dropped, and nothing aborts everything." },

{ id: "5-4", d: 5, ts: "5.5", type: "sim", mins: 12, title: "Calibrate the review queue",
  summary: "Set per-document-type confidence thresholds to hit an error target within a review budget.",
  brief: ["The extraction system processed 11,000 fields from a labeled validation set. Fields at or above a type's confidence threshold are auto-accepted; the rest go to human review. Figures below are illustrative sample data.",
          "Goal: auto-accepted error at or below **2.0%** for every document type, with total human review (including audit sampling) at or below **30%** of fields."],
  takeaway: "Aggregate accuracy hid a 20% error rate on handwritten forms. Per-segment thresholds, calibrated on labeled data, meet the target at half the review cost of one global threshold. Stratified audit sampling keeps watching every segment after launch." },

{ id: "5-5", d: 5, ts: "5.4", type: "order", mins: 5, title: "Run a long codebase investigation",
  summary: "Order the steps that keep a multi-day refactor coherent.",
  brief: ["You're refactoring authentication across a legacy codebase over several days. Put the workflow in order."],
  items: [
    "Delegate broad discovery (where is auth handled?) to an Explore subagent that returns a summary",
    "Write the key findings to a scratchpad file: paths, call graph, open questions",
    "Plan the change in plan mode, working from the summary rather than raw file dumps",
    "Execute in small steps, updating a progress manifest after each one",
    "When the context gets long, run /compact or start fresh, re-seeded from the scratchpad and manifest",
    "After a crash or a lost session, resume by reading the manifest instead of re-exploring"
  ],
  why: "Discovery is delegated so the main context stays clean; findings are persisted before they can degrade; planning works from the summary; and the manifest makes both compaction and crash recovery cheap.",
  takeaway: "Long work survives context limits when its state lives in files, not only in the conversation." },

{ id: "5-6", d: 5, ts: "5.6", type: "classify", mins: 5, title: "Handle provenance in synthesis",
  summary: "Decide how the report should present six claims.",
  brief: ["The synthesizer is assembling the final report. Choose how each claim should appear."],
  buckets: ["Report with its source", "Show both and flag the conflict", "Verify before using"],
  items: [
    { t: "Market size: $4.2B (Gartner, 2024) and $5.1B (IDC, 2024)", a: 1, why: "Credible sources disagree. Show both with sources and dates, and note the methodology difference if known. Don't average or pick one." },
    { t: "\"Adoption grew 34% in 2023\" with a Pew survey URL and publication date attached", a: 0, why: "Attributed and dated. Report it with the citation." },
    { t: "A figure in the draft that no subagent's findings contain", a: 2, why: "No provenance. It may be a hallucination; trace it or drop it." },
    { t: "Two news articles give different launch dates for the same product", a: 1, why: "A factual conflict. Present both with their sources." },
    { t: "Quarterly revenue table from a 10-K, page 47", a: 0, why: "Primary source with a page reference. Render it as a table." },
    { t: "A statistic from an undated blog post that cites no primary source", a: 2, why: "Unverifiable provenance. Find the primary source or leave it out." }
  ],
  takeaway: "Every claim keeps its source, date and location. Conflicts are shown, not resolved by fiat, and unattributed figures don't ship." }
];

/* Calibration simulator data (illustrative): counts and labeled accuracy per confidence bin. */
window.CALIBRATION = {
  bins: [0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95],
  types: [
    { name: "Typed invoices", counts: [30, 40, 50, 60, 90, 150, 280, 600, 1400, 4300], acc: [.82, .85, .88, .90, .93, .95, .97, .985, .994, .998] },
    { name: "Scanned receipts", counts: [60, 80, 100, 140, 180, 250, 330, 400, 460, 500], acc: [.70, .74, .78, .82, .86, .90, .94, .965, .98, .99] },
    { name: "Handwritten forms", counts: [120, 140, 160, 170, 170, 170, 160, 150, 140, 120], acc: [.55, .60, .66, .72, .78, .84, .89, .93, .965, .985] }
  ],
  errTarget: 0.02, reviewBudget: 0.30, auditRate: 0.02
};
