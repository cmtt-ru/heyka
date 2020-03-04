const path = require('path');

module.exports = {
  pages: {
    index: {
      entry: 'src/renderer/main.js',
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
      mainProcessFile: 'src/main/index.js',
    },
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'translations',
      enableInSFC: true,
    },
  },
};
