const { withNxMetro } = require('@nx/expo');
const { getDefaultConfig } = require('@expo/metro-config');
const { mergeConfig } = require('metro-config');
const path = require('path');

const appRoot = __dirname;
const appPrefix = path.relative(path.resolve(appRoot, '../..'), appRoot);

const defaultConfig = getDefaultConfig(appRoot);
const expoRewriteRequestUrl = defaultConfig.server.rewriteRequestUrl;
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
  cacheVersion: '@org/mobile',
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'cjs', 'mjs', 'svg'],
  },
  server: {
    rewriteRequestUrl: (url) => {
      const rewritten = expoRewriteRequestUrl(url);

      const match = rewritten.match(/^\/assets\/(.+?)(\?.*)?$/);
      if (!match) {
        return rewritten;
      }

      const assetSubPath = decodeURIComponent(match[1]);
      if (
        !assetSubPath.startsWith(`${appPrefix}/`) &&
        (assetSubPath.startsWith('assets/') ||
          assetSubPath.startsWith('./assets/'))
      ) {
        const fixedPath = `${appPrefix}/${assetSubPath.replace(/^\.\//, '')}`;
        const query = match[2] ?? '';
        const separator = query ? '&' : '?';
        return `/assets${query}${separator}unstable_path=${encodeURIComponent(fixedPath)}`;
      }

      return rewritten;
    },
  },
};

const nxMetroConfig = withNxMetro(mergeConfig(defaultConfig, customConfig), {
  // Change this to true to see debugging info.
  // Useful if you have issues resolving modules
  debug: false,
  // all the file extensions used for imports other than 'ts', 'tsx', 'js', 'jsx', 'json'
  extensions: [],
  // Specify folders to watch, in addition to Nx defaults (workspace libraries and node_modules)
  watchFolders: [],
});

/**
 * withNxMetro forces `projectRoot` to the workspace root so originModulePath
 * stays workspace-relative (needed for Expo SDK 54+). But expo-router's
 * babel plugin also reads `projectRoot` to resolve its app-root path
 * (`src/app`) to an absolute path, then computes the require.context
 * directory relative to *this* app's node_modules/expo-router - forcing it
 * to workspace root breaks that math and makes expo-router see zero routes
 * (silently falling back to the "Welcome to Expo" tutorial screen). Nx's
 * own resolveRequest/nodeModulesPaths/watchFolders above already reference
 * the workspace root directly rather than through `projectRoot`, so setting
 * it back to this app's directory only affects the router-root
 * calculation, not module resolution.
 */
nxMetroConfig.projectRoot = appRoot;

module.exports = nxMetroConfig;
