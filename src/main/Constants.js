import { heykaStore } from './localStore';

let IS_DEV = process.env.NODE_ENV === 'development';
const IS_WIN = process.platform === 'win32';
const IS_MAC = process.platform === 'darwin';
const IS_LINUX = process.platform === 'linux';
const IS_IOS = typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const IS_ELECTRON = true;

const forceDevServer = heykaStore.get('devServer') || false;

if (forceDevServer) {
  IS_DEV = true;
}

// Base urls
const API_URL = IS_DEV ? process.env.VUE_APP_API_DEV_URL : process.env.VUE_APP_API_PROD_URL;
const WEB_URL = IS_DEV ? process.env.VUE_APP_WEB_DEV_URL : process.env.VUE_APP_WEB_PROD_URL;
const COOKIE_URL = API_URL.split('.').splice(-2)
  .join('.');

module.exports = {
  IS_DEV,
  IS_WIN,
  IS_MAC,
  IS_LINUX,
  IS_ELECTRON,
  IS_IOS,

  API_URL,
  WEB_URL,
  COOKIE_URL,
};
