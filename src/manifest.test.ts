import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

/**
 * `server.json` is the MCP Registry's copy of this release, and it names the
 * version three times: the server, the npm package, and the tag inside the OCI
 * identifier. The registry verifies ownership rather than freshness, so a bump
 * that misses one of them republishes metadata pointing at the previous
 * artifacts and nothing fails. These assertions are what fails instead.
 */
function read(name: string): Record<string, string> {
  return JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
}

test('server.json names the version this package actually publishes', () => {
  const { version } = read('package.json');
  const server = read('server.json') as unknown as {
    version: string;
    packages: { registryType: string; identifier: string; version?: string }[];
  };

  assert.equal(server.version, version, 'server version');

  const npm = server.packages.find((entry) => entry.registryType === 'npm');
  assert.ok(npm, 'server.json declares an npm package');
  assert.equal(npm.version, version, 'npm package version');

  const oci = server.packages.find((entry) => entry.registryType === 'oci');
  assert.ok(oci, 'server.json declares an oci package');
  // The registry's validator rejects a `version` field on an OCI entry, so the
  // tag inside the identifier is the only place that version can live.
  assert.equal(oci.version, undefined, 'an oci entry must carry no version field');
  assert.equal(oci.identifier, `ghcr.io/getanyapi-com/mcp:${version}`, 'oci image tag');
});

test('the npm package claims the server name the registry verifies against', () => {
  assert.equal(read('package.json').mcpName, read('server.json').name);
});
