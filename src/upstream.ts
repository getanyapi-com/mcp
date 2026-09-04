import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import { upstreamHeaders, type ProxyConfig } from './config.js';

/** A connected client for the hosted AnyAPI MCP server. */
export interface Upstream {
  client: Client;
  /** Server instructions reported by the hosted server, when it sent any. */
  instructions: string | undefined;
  close(): Promise<void>;
}

const CLIENT_INFO = { name: 'anyapi-mcp', version: '0.1.0' } as const;

/**
 * Connect to the hosted AnyAPI MCP server.
 *
 * Connecting eagerly is deliberate. A proxy that cannot reach its upstream has
 * no tools to offer, so failing at startup with the real network error is more
 * useful than answering `initialize` and then failing every `tools/list`.
 */
export async function connectUpstream(config: ProxyConfig): Promise<Upstream> {
  const transport = new StreamableHTTPClientTransport(config.url, {
    requestInit: { headers: upstreamHeaders(config) },
  });
  const client = new Client(CLIENT_INFO, { capabilities: {} });
  await client.connect(transport);
  return {
    client,
    instructions: client.getInstructions(),
    close: () => client.close(),
  };
}
