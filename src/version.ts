import { createRequire } from 'node:module';

/**
 * The package version, read from `package.json` rather than authored here.
 *
 * The version appears in two places on the wire: the MCP server info this
 * proxy reports downstream, and the client info it presents to the hosted
 * server. Both are the same release, so a release bump must not need three
 * edits that can disagree.
 */
export const VERSION: string = (
  createRequire(import.meta.url)('../package.json') as { version: string }
).version;
