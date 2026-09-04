import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import type { Upstream } from './upstream.js';

const SERVER_INFO = { name: 'anyapi', version: '0.1.0' } as const;

/**
 * Build a stdio-facing MCP server that forwards to the hosted AnyAPI server.
 *
 * Tools are read from the hosted server rather than declared here. AnyAPI's
 * catalog and its tool schemas change without this package being republished,
 * so a list baked in at build time would be a second source of truth that goes
 * stale silently.
 */
export function createProxyServer(upstream: Upstream): Server {
  const server = new Server(SERVER_INFO, {
    capabilities: { tools: {} },
    ...(upstream.instructions ? { instructions: upstream.instructions } : {}),
  });

  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    const params = request.params?.cursor ? { cursor: request.params.cursor } : undefined;
    return upstream.client.listTools(params);
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return upstream.client.callTool(request.params);
  });

  return server;
}
