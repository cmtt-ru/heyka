const path = require('path');

module.exports = {
  pages: {
    index: {
      entry: './src/renderer/main.js',
      template: './public/index.html',
    },
  },

  configureWebpack: {
    resolve: {
      alias: {
        '@static': path.resolve(__dirname, 'public'),
        '@': path.resolve(__dirname, 'src/renderer'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@styles': path.resolve(__dirname, 'src/renderer/styles'),
        '@icons': path.resolve(__dirname, 'src/renderer/components/icons'),
        '@views': path.resolve(__dirname, 'src/renderer/views'),
        '@components': path.resolve(__dirname, 'src/renderer/components'),
        '@libs': path.resolve(__dirname, 'src/renderer/libs'),
        '@classes': path.resolve(__dirname, 'src/renderer/classes'),
        '@shared': path.resolve(__dirname, 'src/shared'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@contextMenus': path.resolve(__dirname, 'src/renderer/views/ContextMenus'),
      },
    },
  },

  pluginOptions: {
    electronBuilder: {
      customFileProtocol: 'heyka://./',
      mainProcessFile: 'src/main/index.js',
      builderOptions: {
        productName: 'Heyka',
        appId: 'com.heyka.test',
        protocols: {
          name: 'Heyka',
          schemes: [
            'heyka',
          ],
        },
      },
    },
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'translations',
      enableInSFC: true,
    },
    svgSprite: {
      dir: 'src/assets/icons',
      test: /\.svg$/,
      loaderOptions: {
        extract: true,
        spriteFilename: 'img/icons.svg',
      },
    },
  },

  chainWebpack: config => {
    config.module
      .rule('svg-sprite')
      .use('svgo-loader')
      .loader('svgo-loader');
  },
};
