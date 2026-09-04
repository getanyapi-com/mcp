import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { createProxyServer } from './proxy.js';
import type { Upstream } from './upstream.js';

function fakeUpstream(calls: unknown[]): Upstream {
  return {
    instructions: 'upstream instructions',
    close: async () => {},
    client: {
      listTools: async (params?: unknown) => {
        calls.push(['listTools', params]);
        return { tools: [{ name: 'run_api', inputSchema: { type: 'object' } }] };
      },
      callTool: async (params: unknown) => {
        calls.push(['callTool', params]);
        return { content: [{ type: 'text', text: 'ok' }] };
      },
    } as unknown as Upstream['client'],
  };
}

/** Connect a real MCP client to the proxy over a linked in-memory transport. */
async function connect(calls: unknown[]): Promise<Client> {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  const server = createProxyServer(fakeUpstream(calls));
  const client = new Client({ name: 'test', version: '1' }, { capabilities: {} });
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  return client;
}

test('tools are read from the upstream server, never declared locally', async () => {
  const calls: unknown[] = [];
  const client = await connect(calls);
  const result = await client.listTools();
  assert.deepEqual(result.tools.map((tool) => tool.name), ['run_api']);
  assert.deepEqual(calls, [['listTools', undefined]]);
  await client.close();
});

test('a list cursor is forwarded, so pagination stays the upstream server\'s', async () => {
  const calls: unknown[] = [];
  const client = await connect(calls);
  await client.listTools({ cursor: 'page-2' });
  assert.deepEqual(calls, [['listTools', { cursor: 'page-2' }]]);
  await client.close();
});

test('a tool call is forwarded unchanged', async () => {
  const calls: unknown[] = [];
  const client = await connect(calls);
  const params = { name: 'run_api', arguments: { sku_id: 'reddit.search' } };
  const result = await client.callTool(params);
  assert.deepEqual(result.content, [{ type: 'text', text: 'ok' }]);
  assert.deepEqual(calls, [['callTool', params]]);
  await client.close();
});

test('the upstream server\'s instructions reach the client', async () => {
  const client = await connect([]);
  assert.equal(client.getInstructions(), 'upstream instructions');
  await client.close();
});
