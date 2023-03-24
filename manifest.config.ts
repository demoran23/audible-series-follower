import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from './package.json';

const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/);

export default defineManifest(async (env) => ({
  action: {
    default_popup: 'index.html',
  },
  background: {
    service_worker: 'src/background',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['*://audible.com/series*', '*://www.audible.com/series*'],
      js: ['src/content_scripts/audible.com'],
      run_at: 'document_end',
      all_frames: false,
    },
  ],
  description: 'Follow your favorite series on Audible',
  icons: {
    '16': 'favicon-16x16.png',
    '32': 'favicon-32x32.png',
    '128': 'favicon-32x32.png',
  },
  permissions: ['storage', 'alarms'],
  manifest_version: 3,
  name: 'Audible Series Follower',
  version: '1.0',
}));
