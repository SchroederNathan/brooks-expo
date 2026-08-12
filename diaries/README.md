# AI-agent development diaries

Create one concise diary entry for each substantial implementation or research
task. The goal is to preserve evidence that can improve Expo and Exact, not to
capture private chain-of-thought or duplicate normal code documentation.

## File naming

Use:

```text
diaries/YYYY-MM-DD-<system>-<task-slug>.md
```

Examples:

```text
diaries/2026-07-13-research-brooks-api.md
diaries/2026-07-14-expo-product-grid.md
diaries/2026-07-14-exact-product-grid.md
```

If a filename already exists, add a short distinguishing suffix. Do not append
unrelated work to another agent's entry.

## Entry template

```markdown
# <Task title>

**Date:** YYYY-MM-DD
**Agent:** <agent/model or human name>
**System:** Expo | Exact | Shared | Research
**Scope:** <issue, commit, or short task description>

## Outcome

What changed or was learned? Link evidence where useful.

## What worked well

Tools, APIs, patterns, or workflows that were effective.

## Friction and blockers

Where time was lost, including errors and unsuccessful approaches at a useful
summary level.

## What was hard

The technically tricky or surprising parts and why they matter.

## Expo and Exact comparison

What would have been easier or harder in the other system? Write `Not observed`
when the task provides no evidence.

## Improvement ideas

Specific, actionable changes that could improve Expo, Exact, their tooling, or
their documentation.

## Follow-ups

Remaining work or questions. Write `None` when complete.
```

## Quality bar

- Prefer observations and reproducible evidence over speculation.
- Include errors, commands, screenshots, traces, or links when they materially
  help reproduce a problem, but never include credentials or private data.
- Keep entries short enough to scan. A diary is not a transcript.
- Commit the diary with the work that produced it whenever practical.
