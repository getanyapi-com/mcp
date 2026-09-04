import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readConfig, upstreamHeaders } from './config.js';

test('defaults to the hosted AnyAPI endpoint', () => {
  const config = readConfig({});
  assert.equal(config.url.href, 'https://api.getanyapi.com/mcp');
  assert.equal(config.apiKey, undefined);
});

test('an override URL wins', () => {
  const config = readConfig({ ANYAPI_MCP_URL: 'https://example.test/mcp' });
  assert.equal(config.url.href, 'https://example.test/mcp');
});

test('a malformed override URL is rejected by name', () => {
  assert.throws(() => readConfig({ ANYAPI_MCP_URL: 'not a url' }), /ANYAPI_MCP_URL/);
});

test('blank environment values fall back to the defaults', () => {
  const config = readConfig({ ANYAPI_MCP_URL: '   ', ANYAPI_API_KEY: '  ' });
  assert.equal(config.url.href, 'https://api.getanyapi.com/mcp');
  assert.equal(config.apiKey, undefined);
});

test('no key means no Authorization header, so discovery stays keyless', () => {
  assert.deepEqual(upstreamHeaders(readConfig({})), {});
});

test('a key is sent as a bearer token', () => {
  const config = readConfig({ ANYAPI_API_KEY: 'aa_live_example' });
  assert.deepEqual(upstreamHeaders(config), { Authorization: 'Bearer aa_live_example' });
});
