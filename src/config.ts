/** Where the hosted AnyAPI MCP server lives, and how to authenticate to it. */
export interface ProxyConfig {
  /** Absolute URL of the hosted AnyAPI MCP endpoint. */
  url: URL;
  /** AnyAPI key, when the operator supplied one. Discovery works without it. */
  apiKey: string | undefined;
}

const DEFAULT_URL = 'https://api.getanyapi.com/mcp';

/**
 * Read the proxy configuration from the environment.
 *
 * `ANYAPI_API_KEY` is optional on purpose: the hosted server answers
 * `initialize` and `tools/list` without a credential, so discovery and any
 * directory health check work unauthenticated. Only `tools/call` needs a key.
 */
export function readConfig(env: NodeJS.ProcessEnv = process.env): ProxyConfig {
  const raw = env.ANYAPI_MCP_URL?.trim() || DEFAULT_URL;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`ANYAPI_MCP_URL is not a valid URL: ${raw}`);
  }
  const apiKey = env.ANYAPI_API_KEY?.trim() || undefined;
  return { url, apiKey };
}

/** Headers sent on every request to the hosted server. */
export function upstreamHeaders(config: ProxyConfig): Record<string, string> {
  return config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {};
}
