#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { readConfig } from './config.js';
import { createProxyServer } from './proxy.js';
import { connectUpstream } from './upstream.js';

async function main(): Promise<void> {
  const config = readConfig();
  const upstream = await connectUpstream(config);
  const server = createProxyServer(upstream);
  await server.connect(new StdioServerTransport());

  const shutdown = async (): Promise<void> => {
    await server.close();
    await upstream.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

main().catch((error: unknown) => {
  // stdout is the MCP transport, so diagnostics must go to stderr.
  process.stderr.write(`anyapi-mcp: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
