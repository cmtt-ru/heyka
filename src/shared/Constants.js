const IS_DEV = process.env.NODE_ENV === 'development';
const IS_WIN = process.platform === 'win32';
const IS_MAC = process.platform === 'darwin';
const IS_LINUX = process.platform === 'linux';

// global variables
window.IS_DEV = IS_DEV;
window.IS_WIN = IS_WIN;
window.IS_MAC = IS_MAC;
window.IS_LINUX = IS_LINUX;

module.exports = {
  IS_DEV,
  IS_WIN,
  IS_MAC,
  IS_LINUX,
};