const notarize = require('electron-notarize').notarize;

module.exports = async (context) => {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName === 'darwin') {
    try {
      const appName = context.packager.appInfo.productFilename;

      const data = {
        appBundleId: 'app.live.hejka',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: process.env.APPLE_DEVELOPER_ID,
        appleIdPassword: process.env.APPLE_ASP,
      };

      console.log('Try notarize app', data);

      await notarize(data);
      console.log('Success notarize');
    } catch (err) {
      console.log(err);
    }
  }
};
