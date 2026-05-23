const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const run = (cmd, options = {}) => {
  execSync(cmd, { stdio: 'inherit', shell: true, ...options });
};

const capture = (cmd, options = {}) =>
  execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', shell: true, ...options })
    .trim();

const buildDir = path.join(process.cwd(), 'build');
if (!fs.existsSync(buildDir)) {
  console.error('build directory not found. Run `yarn build` first.');
  process.exit(1);
}

const remoteUrl = capture('git config --get remote.origin.url');
const sourceCommit = capture('git rev-parse --short HEAD');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eng-meeting-pages-'));

try {
  fs.cpSync(buildDir, tmpDir, { recursive: true });
  run('git init -q', { cwd: tmpDir });
  run('git checkout -b gh-pages', { cwd: tmpDir });
  run('git config user.name "github-actions[bot]"', { cwd: tmpDir });
  run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"', {
    cwd: tmpDir
  });
  run(`git remote add origin "${remoteUrl}"`, { cwd: tmpDir });
  run('git add -A', { cwd: tmpDir });
  run(`git commit -m "deploy: update pages from ${sourceCommit}"`, { cwd: tmpDir });
  run('git push origin gh-pages --force', { cwd: tmpDir });
  console.log(`[deploy] gh-pages updated from ${sourceCommit}.`);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
