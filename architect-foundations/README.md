# CCA‑F Architect Lab

A hands-on prep course for the **Claude Certified Architect – Foundations** exam. It follows the exam guide's five domains, six scenarios and task statements, and goes further than a question bank: most of the time is spent building and debugging the things the exam asks about.

## What's inside

| Part | Contents |
| --- | --- |
| Domain sheets (D1–D5) | Every task statement condensed to what's tested, plus the trap answer for each |
| 29 labs | 5 code labs with unit tests, 2 bug hunts, 4 config builders, 3 author-and-validate editors (MCP error payloads, a path-scoped rule with a live glob matcher, an extraction schema), 12 triage drills, 2 sequencing exercises, 1 confidence-calibration simulator |
| Mock exam | 60 items from 4 randomly drawn scenarios (of 6), 120 minutes, scaled score with a 720 cut, results by domain and scenario with links back to the relevant labs |
| Practice mode | Untimed sets by scenario or by domain, with an explanation for every option |

The question bank holds 90 items (15 per scenario). Options are shuffled on each attempt, and option lengths are balanced so length doesn't give the answer away.

## Files

```
index.html     page shell and styles (published as an Artifact, so it has no <html>/<head> wrapper)
js/labs.js     domain briefings, lab definitions, code-lab test harnesses
js/bank.js     scenarios and the exam question bank
js/app.js      routing, lab engines, sandboxed code runner, mock exam, practice mode
```

Code labs run the learner's JavaScript in a Web Worker created from a blob URL, with a 4-second timeout so an infinite loop can't freeze the page. Progress is stored only in the browser's `localStorage`.

## Running locally

Serve the folder with any static server, for example `python3 -m http.server` from this directory, then open `http://localhost:8000/`.

## Accuracy notes

The exam guide describes forced `tool_choice` (`any` or a named tool). Current models (Claude Opus 5.5, Sonnet 5.5, Fable 5.1) reject forced choice with a 400, so no item makes it the correct answer; the course flags this and similar drift (assistant prefill, `budget_tokens`) on the overview page.

Practice material only. Not affiliated with or endorsed by Anthropic.
