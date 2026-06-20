const { spawn, exec } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const backendDir = path.join(root, 'backend');
const frontendDir = path.join(root, 'WebProject', 'donation-system');
const FRONTEND_URL = 'http://127.0.0.1:5500';

function run(command, args, cwd, label) {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'inherit'
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${label}] exited with code ${code}`);
    }
  });

  return child;
}

function openBrowser(url) {
  const command = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;

  exec(command, (error) => {
    if (error) {
      console.log(`Open this link in your browser: ${url}`);
    }
  });
}

console.log('Starting CareHaven...');
console.log('  Backend:  http://localhost:5000/api/health');
console.log(`  Frontend: ${FRONTEND_URL}`);
console.log('');
console.log('Tip: The website opens in your browser, not inside VS Code.');
console.log('');

const backend = run('npm', ['run', 'dev'], backendDir, 'backend');
const frontend = run('python', ['-m', 'http.server', '5500'], frontendDir, 'frontend');

setTimeout(() => {
  console.log(`Opening ${FRONTEND_URL} in your browser...`);
  openBrowser(FRONTEND_URL);
}, 3000);

function shutdown() {
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
