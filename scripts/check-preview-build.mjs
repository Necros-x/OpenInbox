// CI-only compilation check of the isolated preview config. NO Cloudflare API calls or deployment.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('wrangler.preview.jsonc', 'utf8'));
if (config.name !== 'necros-mail-preview' || config.d1_databases?.[0]?.database_name !== 'necros-mail-preview') {
  throw new Error('The isolated preview Worker or D1 database name changed.');
}
// Wrangler/Vite requires a database ID in the build config; this dummy value never gets deployed.
config.d1_databases[0].database_id = '00000000-0000-0000-0000-000000000000';
const generated = './wrangler.preview.generated.jsonc';
writeFileSync(generated, JSON.stringify(config, null, 2) + '\n');
const env = { ...process.env, CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH: generated };
execFileSync('npm', ['run', 'build'], { stdio: 'inherit', env });
if (!existsSync('dist/necros-mail-preview/wrangler.json')) {
  throw new Error('Preview build did not output dist/necros-mail-preview/wrangler.json');
}
console.log('Preview bundle compiled with a separate Worker/D1 binding; no remote Cloudflare resources were accessed.');
