const IS_DEV = process.env.NODE_ENV === 'development';
const path = require('path');
const HawkWebpackPlugin = require('@hawk.so/webpack-plugin');
const buildRevision = Date.now();
const webpackPlugins = [];

/**
 * Add the Hawk plugin for sending source maps
 */
if (process.env.VUE_APP_HAWK_TOKEN) {
  webpackPlugins.push(
    new HawkWebpackPlugin({
      integrationToken: process.env.VUE_APP_HAWK_TOKEN,
      release: buildRevision,
    })
  );
}

module.exports = {
  pages: {
    index: {
      entry: './src/renderer/main.js',
      template: './public/index.html',
    },
  },

  configureWebpack: {
    target: 'web',
    resolve: {
      alias: {
        '@static': path.resolve(__dirname, 'public'),
        '@': path.resolve(__dirname, 'src/renderer'),
        '@sdk': path.resolve(__dirname, 'src/sdk'),
        '@assets': path.resolve(__dirname, 'src/sdk/assets'),
        '@styles': path.resolve(__dirname, 'src/renderer/styles'),
        '@views': path.resolve(__dirname, 'src/renderer/views'),
        '@components': path.resolve(__dirname, 'src/sdk/components'),
        '@libs': path.resolve(__dirname, 'src/sdk/libs'),
        '@classes': path.resolve(__dirname, 'src/renderer/classes'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@api': path.resolve(__dirname, 'src/sdk/api'),
        '@contextMenus': path.resolve(__dirname, 'src/renderer/views/ContextMenus'),
      },
    },
    plugins: webpackPlugins,
    devtool: IS_DEV ? 'source-map' : 'hidden-source-map',
  },

  pluginOptions: {
    electronBuilder: {
      customFileProtocol: 'heyka://./',
      mainProcessFile: 'src/main/index.js',
      builderOptions: {
        protocols: {
          name: 'Heyka',
          schemes: [
            'heyka',
          ],
        },
      },
      preload: 'public/preload.js',
    },
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'translations',
      enableInSFC: true,
    },
    svgSprite: {
      dir: 'src/sdk/assets/icons',
      test: /\.svg$/,
      loaderOptions: {
        extract: true,
        spriteFilename: 'img/icons.svg',
      },
    },
  },

  chainWebpack: config => {
    const mediaRule = config.module.rule('media');

    mediaRule.uses.clear();
    mediaRule
      .test(/\.(ogg|mp3|wav|flac|aac)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .tap(options => {
        return {
          limit: 4096,
          fallback: {
            loader: 'file-loader',
            options: {
              name: 'media/[name].[hash:8].[ext]',
            },
          },
        };
      });

    config.module
      .rule('video')
      .test(/\.(mp4|webp)?$/)
      .use('url-loader')
      .loader('url-loader');

    config.module
      .rule('svg-sprite')
      .use('svgo-loader')
      .loader('svgo-loader');

    /**
     * Use DefinePlugin to pass some variables to the sources
     */
    config.plugin('define').tap((definitions) => {
      definitions[0] = {
        ...definitions[0],
        /**
         * Current bundle version will be passed to the Hawk Catcher
         */
        buildRevision,
      };

      return definitions;
    });

    config.optimization.minimize(false);
  },
};
