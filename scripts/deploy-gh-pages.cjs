const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const run = (cmd, capture = false) => {
  const options = { shell: true };
  if (capture) {
    options.stdio = ['ignore', 'pipe', 'pipe'];
    options.encoding = 'utf8';
    return execSync(cmd, options);
  }
  execSync(cmd, { stdio: 'inherit', ...options });
  return null;
};

const remote = 'origin';
const tmpBranch = `gh-pages-tmp-${Date.now()}`;

if (!fs.existsSync(path.join(process.cwd(), 'build'))) {
  console.error('build directory not found. Run `yarn build` first.');
  process.exit(1);
}

const currentBranch = run('git rev-parse --abbrev-ref HEAD', true).toString().trim();
console.log(`[deploy] current branch: ${currentBranch}`);

const cleanup = () => {
  try {
    run(`git branch -D ${tmpBranch}`);
  } catch {}
};

const splitOrReuse = () => {
  try {
    const out = run(`git subtree split --prefix build -b ${tmpBranch}`, true);
    const commit = out.toString().trim();
    if (!commit) throw new Error('subtree split returned empty commit');
    console.log(`[deploy] generated ${tmpBranch}: ${commit}`);
    return;
  } catch (err) {
    const msg = `${err.stdout?.toString() || ''}${err.stderr?.toString() || ''}${err.message || ''}`;
    if (!String(msg).includes('no new revisions were found')) {
      throw err;
    }
    run(`git fetch ${remote} gh-pages`);
    const remoteHash = run(`git rev-parse ${remote}/gh-pages`, true).toString().trim();
    if (!remoteHash) {
      throw new Error('gh-pages remote branch not found and subtree split had no new revisions.');
    }
    run(`git branch ${tmpBranch} ${remoteHash}`);
    console.log('[deploy] no new build changes; reusing existing gh-pages commit for push.');
  }
};

try {
  splitOrReuse();
  run(`git push ${remote} ${tmpBranch}:gh-pages -f`);
  console.log('[deploy] gh-pages updated.');
} finally {
  cleanup();
  try {
    run(`git checkout ${currentBranch}`);
  } catch {}
}
