/** @type {import('jest').Config} */
module.exports = {
  displayName: '@org/mobile',
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    '[.]svg$': '@nx/expo/plugins/jest/svg-mock',
    // Workspace libs (e.g. @org/game-engine) are non-buildable TS consumed
    // via nodenext-style relative imports with explicit .js extensions;
    // jest-expo's resolver (unlike @nx/jest's) doesn't map those back to
    // the real .ts source files, so strip the extension here instead.
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '[.][jt]sx?$': [
      'babel-jest',
      {
        configFile: __dirname + '/.babelrc.js',
      },
    ],
    '^.+[.](bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp|ttf|otf|m4v|mov|mp4|mpeg|mpg|webm|aac|aiff|caf|m4a|mp3|wav|html|pdf|obj)$':
      require.resolve('jest-expo/src/preset/assetFileTransformer.js'),
  },
  coverageDirectory: '../../coverage/apps/mobile',
};
