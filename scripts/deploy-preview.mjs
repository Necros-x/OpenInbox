// Deploy an isolated NECROS Mail *test* Worker and D1 database. Does not connect email routing.
// Explicitly manual CI only: requires GitHub Actions secrets, never uses production config.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const WORKER = 'necros-mail-preview';
const DATABASE = 'necros-mail-preview';
const GENERATED = 'wrangler.preview.generated.jsonc';

if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
  throw new Error('Cloudflare preview credentials are missing. Set GitHub Actions secrets, not source-code variables.');
}

function wrangler(...args) {
  return execFileSync('npx', ['--no-install', 'wrangler', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    env: { ...process.env, CI: 'true' },
  });
}

console.log('Checking for isolated preview D1 database...');
let databases = JSON.parse(wrangler('d1', 'list', '--json'));
if (!Array.isArray(databases)) throw new Error('Unexpected Wrangler D1 list response.');
let db = databases.find((item) => item.name === DATABASE);
if (!db) {
  console.log('Creating preview-only D1 database...');
  // Do not update the production wrangler.jsonc config during creation.
  wrangler('d1', 'create', DATABASE);
  databases = JSON.parse(wrangler('d1', 'list', '--json'));
  db = databases.find((item) => item.name === DATABASE);
}
const databaseId = db?.uuid ?? db?.id;
if (typeof databaseId !== 'string' || !databaseId) throw new Error('Could not resolve isolated preview database ID.');

const config = JSON.parse(readFileSync('wrangler.preview.jsonc', 'utf8'));
if (config.name !== WORKER || config.d1_databases?.[0]?.database_name !== DATABASE) {
  throw new Error('Preview configuration unexpectedly targets another Worker/database. Refusing deployment.');
}
config.d1_databases[0].database_id = databaseId;
writeFileSync(GENERATED, JSON.stringify(config, null, 2) + '\n');

const env = {
  ...process.env,
  CI: 'true',
  CLOUDFLARE_VITE_WRANGLER_CONFIG_PATH: './' + GENERATED,
};
console.log('Building preview Worker with its own D1 binding...');
execFileSync('npm', ['run', 'build'], { stdio: 'inherit', env });
const outputConfig = 'dist/' + WORKER + '/wrangler.json';
if (!existsSync(outputConfig)) throw new Error('Vite did not emit ' + outputConfig + '; refusing source-only deployment.');

console.log('Deploying ' + WORKER + ' (not production or main)...');
execFileSync('npx', ['--no-install', 'wrangler', 'deploy', '--config', outputConfig], { stdio: 'inherit', env });
console.log('Preview deployment completed. Copy the workers.dev URL from the Wrangler output.');
