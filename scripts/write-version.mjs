import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function gitValue(args, fallback = '') {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return fallback;
  }
}

const commit =
  process.env.GITHUB_SHA ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  gitValue(['rev-parse', 'HEAD'], 'unknown');

const ref =
  process.env.GITHUB_REF_NAME ||
  process.env.GITHUB_REF ||
  gitValue(['branch', '--show-current'], '');

const version = {
  commit,
  sha: commit,
  ref,
  buildTime: new Date().toISOString(),
  source: 'github-pages',
  service: 'eng-meeting'
};

mkdirSync('build', { recursive: true });
writeFileSync(join('build', 'version.json'), `${JSON.stringify(version, null, 2)}\n`);
