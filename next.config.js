// eslint-disable-next-line @typescript-eslint/no-var-requires
const childProcess = require('child_process');

module.exports = {
  generateBuildId: async () => {
    const revision = childProcess
      .execSync('git rev-parse HEAD')
      .toString()
      .trim();

    const buildDate = new Date().toISOString().substring(0, 10);
    // You can, for example, get the latest git commit hash here
    return `${process.env.npm_package_version}-${buildDate.replace(/-/g, '')}-${revision.slice(0, 8)}`;
  },
};
