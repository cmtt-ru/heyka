const notarize = require('electron-notarize').notarize;

module.exports = async (context) => {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName === 'darwin') {
    try {
      console.log('Try notarize app');
      const appName = context.packager.appInfo.productFilename;

      await notarize({
        appBundleId: 'app.live.hejka',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLE_DEVELOPER_ID,
        appleIdPassword: process.env.APPLE_ASP,
      });
      console.log('Success notarize');
    } catch (err) {
      console.log(err);
    }
  }
};