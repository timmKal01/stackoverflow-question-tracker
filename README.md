# Stack Overflow Question Tracker — New Questions by Tag

Track new Stack Overflow (or any Stack Exchange site) questions by tag.
Get the title, tags, view/answer counts, and link the moment someone
asks about your product, library, or topic.

Built for DevRel, support, and product teams who want to know what
people are struggling with in real time, instead of finding out from a
support ticket days later.

## Input

```json
{
  "tags": "rust;async",
  "site": "stackoverflow",
  "unansweredOnly": false,
  "daysBack": 7,
  "maxResults": 25
}
```

| Field | Type | Description |
|---|---|---|
| `tags` | string | One or more tags, semicolon-separated for AND logic, e.g. `"rust;async"` (must have both). Exact Stack Exchange tag spelling. |
| `site` | string | Stack Exchange site by subdomain, e.g. `"stackoverflow"`, `"serverfault"`, `"askubuntu"`, `"dba"`. Default `"stackoverflow"`. |
| `unansweredOnly` | boolean | Only return questions with zero answers so far. Default `false`. |
| `daysBack` | number | How many days back from today to search, by question creation date. Default `7`, max `90`. |
| `maxResults` | number | Max questions to return, most recent first. Default `25`, max `100`. |

## Output

One record per question:

```json
{
  "questionId": 79993607,
  "title": "Can Rust optimize out calls to `into()`, for example in constructors?",
  "tags": ["rust", "optimization"],
  "site": "stackoverflow",
  "isAnswered": false,
  "answerCount": 0,
  "viewCount": 126,
  "score": 1,
  "owner": "Quantasm",
  "createdAt": "2026-08-12T20:20:52.000Z",
  "link": "https://stackoverflow.com/questions/79993607/can-rust-optimize-out-calls-to-into-for-example-in-constructors"
}
```

A search with no matching questions returns no items but is still
billed once for the search.

## How it works

Direct calls to the official [Stack Exchange
API](https://api.stackexchange.com/docs) (`api.stackexchange.com`) — no
proxy, no key, no scraping. The anonymous quota (300 requests/day,
shared across all callers from the same IP) is far more than a
scheduled tracker run needs.

## Pricing note

Billed per **search**, not per question returned — one charge whether
the search returns 0 questions or 100.

## Related products

- [GitHub Repo Discovery Tracker](https://github.com/timmKal01/github-repo-discovery-tracker) — find new open-source projects in the same ecosystem you're already tracking questions about
