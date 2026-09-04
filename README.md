# AnyAPI MCP server

Hundreds of scraping and data APIs through one gateway: one key, USD
pay-per-request, normalized schemas, automatic failover.

This package is a local **stdio** MCP server that proxies to the hosted AnyAPI
MCP server at `https://api.getanyapi.com/mcp`. Clients that speak remote
Streamable HTTP can point at that URL directly and skip this package entirely.
Use this one when your client only launches local MCP servers over stdio.

- Website: https://getanyapi.com
- Docs: https://getanyapi.com/docs - MCP page: https://getanyapi.com/docs/mcp-server
- Contact: support@getanyapi.com

## Install

With `npx`, no clone and no build:

```json
{
  "mcpServers": {
    "anyapi": {
      "command": "npx",
      "args": ["-y", "anyapi-mcp"],
      "env": { "ANYAPI_API_KEY": "aa_live_..." }
    }
  }
}
```

With Docker, from a clone:

```bash
docker build -t anyapi-mcp .
```

```json
{
  "mcpServers": {
    "anyapi": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "ANYAPI_API_KEY", "anyapi-mcp"],
      "env": { "ANYAPI_API_KEY": "aa_live_..." }
    }
  }
}
```

Get a key at https://getanyapi.com/dashboard/keys. Agents can mint their own
free-trial key with no dashboard and no email:

```bash
curl -s -X POST https://api.getanyapi.com/agent/signup
```

## Configuration

| Variable | Required | Default | Meaning |
| --- | --- | --- | --- |
| `ANYAPI_API_KEY` | No | none | Your AnyAPI key. Discovery works without it; running an API needs it. |
| `ANYAPI_MCP_URL` | No | `https://api.getanyapi.com/mcp` | The hosted endpoint to proxy to. |

The key is optional on purpose. The hosted server answers `initialize` and
`tools/list` without a credential, so you can browse the catalog, read schemas,
and price a call before you have an account. Only `tools/call` needs a key.

## Tools

Ten tools, read live from the hosted server rather than declared in this
package, so a catalog or schema change reaches you without a release here.

| Tool | What it does |
| --- | --- |
| `search_apis` | Search APIs by meaning and keyword. Takes any combination of `query`, `category` and `platform`; a scope on its own is a complete search. |
| `list_apis` | Browse the catalog as lightweight summaries (id, name, category, USD pricing), with an optional `category`. |
| `get_api` | The full definition of one API: normalized input/output JSON Schemas, per-lane USD pricing, and trailing-30-day latency. |
| `quote_api` | The exact USD price of a `run_api` call before running it. Nothing is charged or executed. |
| `run_api` | Execute an API by SKU with normalized input. Returns the output, `costUsd`, and items. Supports `fields`, `max_items`, `summary` and `jq`. |
| `get_request` | Inspect or resume a durable request. Reads stored state and never repeats the paid dispatch. |
| `read_result` | Re-shape a prior run's output without re-running or paying again. |
| `get_balance` | The remaining USD wallet balance for the key. |
| `report_bug` | Report wrong, empty, or malformed data for input you believe is valid. Free. |
| `send_feedback` | Report a missing API, a missing field, or anything confusing. Free. |

Failed calls are never charged.

## Develop

```bash
npm install
npm run check   # build, then unit tests
```

`npm run check` needs no network and no API key. To drive the built server
against production by hand:

```bash
npm run build
ANYAPI_API_KEY=aa_live_... node dist/index.js
```

## License

Apache-2.0
