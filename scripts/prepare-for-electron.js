const fs = require('fs-extra');
const path = require('path');

const srcDirectories = [
  'components',
  'directives',
  'pages', 
  'public',
  'reducers',
  'server',
  'styles',
  'utils',
];

['renderer', 'app'].forEach(directory => {
  if (fs.existsSync(directory)) {
    fs.rmdirSync(directory, { recursive: true });
  }
});

fs.mkdirSync('renderer');

srcDirectories.forEach(directory => {
  fs.copySync(directory, path.join('renderer', directory));
});

fs.readdirSync('electron-config').forEach(file => {
  fs.copyFileSync(path.join('electron-config', file), path.join('renderer', path.basename(file)));
});
