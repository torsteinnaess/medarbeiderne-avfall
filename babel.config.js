module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Tamagui babel plugin disabled for now — static extraction
      // has compatibility issues with Expo 55 / RN 0.83.
      // Runtime styling works perfectly without it.
      // Re-enable when @tamagui/babel-plugin releases a fix.
    ],
  };
};
