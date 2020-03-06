const path = require('path');

module.exports = {
  pages: {
    index: {
      entry: './src/background.js',
      template: 'public/index.html',
    },
  },

  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@icons': path.resolve(__dirname, 'src/renderer/components/icons'),
        '@views': path.resolve(__dirname, 'src/renderer/views'),
        '@components': path.resolve(__dirname, 'src/renderer/components'),
        '@libs': path.resolve(__dirname, 'src/renderer/libs'),
        '@classes': path.resolve(__dirname, 'src/renderer/classes'),
      },
    },
  },

  pluginOptions: {
    electronBuilder: {
      mainProcessFile: 'src/background.js',
      builderOptions: {
        productName: 'Heyka',
        appId: 'com.heyka.test',
        asar: true,
        protocols: {
          name: 'Heyka',
          schemes: [
            'heheh',
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
        spriteFilename: 'img/icons.[hash:8].svg', // or 'img/icons.svg' if filenameHashing == false
      },
      pluginOptions: {
        plainSprite: true,
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
