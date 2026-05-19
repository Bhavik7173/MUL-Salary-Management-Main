const path = require("path");

const webpackConfig = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      // Replace broken terser-webpack-plugin with a simple no-op minimizer
      // This fixes the ajv/dist/compile/codegen error on Node 20+
      if (process.env.NODE_ENV === 'production') {
        const TerserPlugin = require('terser-webpack-plugin');
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          minimizer: [
            new TerserPlugin({
              minify: TerserPlugin.swcMinify,
              terserOptions: {},
            }),
          ],
        };
      }

      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/build/**',
        ],
      };

      return webpackConfig;
    },
  },
};

module.exports = webpackConfig;