// Learn more: https://docs.expo.dev/guides/monorepos/
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { FileStore } = require("metro-cache");
const { withNativewind } = require("nativewind/metro");

// Watch monorepo files
// const monorepoRoot = path.resolve(__dirname, '../..');
//
// config.watchFolders = [monorepoRoot];
// config.resolver = {
//   ...config.resolver,
//   sourceExts: [...config.resolver.sourceExts, 'mjs', 'cjs'],
//   nodeModulesPaths: [
//  k  path.resolve(__dirname, 'node_modules'),
//     path.resolve(monorepoRoot, 'node_modules'),
//   ]
// };

const config = getDefaultConfig(__dirname);
config.cacheStores = [
  new FileStore({
    root: path.join(__dirname, "node_modules", ".cache", "metro"),
  }),
];


/** @type {import('expo/metro-config').MetroConfig} */
module.exports = withNativewind(config, {
  input: "./src/styles.css",
  inlineRem: 16,
});
