const loadConfig = require('@react-native-community/cli-config').default;

function isValidRNDependency(config) {
  return Object.keys(config.platforms || {}).some(key => Boolean(config.platforms[key]));
}

function filterConfig(config) {
  const filtered = {
    ...config,
  };
  const dependencies = {};

  Object.keys(filtered.dependencies || {}).forEach(name => {
    const dependency = filtered.dependencies[name];

    if (dependency && isValidRNDependency(dependency)) {
      dependencies[name] = dependency;
    }
  });

  return {
    ...filtered,
    dependencies,
  };
}

const config = loadConfig({ projectRoot: process.cwd() });
const payload = `${JSON.stringify(filterConfig(config), null, 2)}\n`;

process.stdout.write(payload, () => {
  process.exit(0);
});
