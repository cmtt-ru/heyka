import { ipcRenderer } from 'electron';
import { heykaStore } from '@/store/localStore';

/**
 * @typedef {object} AppState
 * @property {string} appName – app name
 * @property {string} appVersion – app version
 * @property {string} language – language
 * @property {string} runAppFrom – run from tray or dock
 * @property {boolean} autorun – autorun
 * @property {boolean} collectAnalytics – whether to collect analytics
 * @property {array} privacyLogs – privacy logs
 *
 * @property {object} theme – color theme
 * @property {string} theme.name – theme name
 * @property {boolean} theme.auto – theme auto choose
 *
 * @property {object} devices – list of user devices
 * @property {boolean} devices.speakers – speakers
 * @property {boolean} devices.microphones – microphones
 * @property {boolean} devices.cameras – web cameras
 *
 * @property {object} selectedDevices – list of selected devices
 * @property {string} selectedDevices.speaker – selected speaker
 * @property {string} selectedDevices.microphone – selected microphone
 * @property {string} selectedDevices.camera – selected camera
 *
 * @property {object} realSelectedDevices – list of real selected devices
 * @property {string} realSelectedDevices.speaker – selected speaker
 * @property {string} realSelectedDevices.microphone – selected microphone
 * @property {string} realSelectedDevices.camera – selected camera
 *
 * @property {number} microphoneVolume – current microphone volume in decibels
 * @property {array} notifications – in-app notifications
 * @property {string} search – workspace search
 */

/**
 * App state
 * @returns {AppState}
 */
const state = () => {
  /**
   * @namespace AppState
   */
  return {
    appName: 'Heyka Desktop',
    appVersion: ipcRenderer.sendSync('remote-getVersion'),
    language: heykaStore.get('language', 'en'),
    runAppFrom: heykaStore.get('runAppFrom', 'window'),
    autorun: heykaStore.get('autorun', true),
    resizeWindow: heykaStore.get('resizeWindow', false),
    muteMic: heykaStore.get('muteMic', false),
    closeOverlayButton: heykaStore.get('closeOverlayButton', true),
    theme: heykaStore.get('theme', {
      name: 'light',
      auto: false,
    }),
    devices: {
      speakers: [],
      microphones: [],
      cameras: [],
    },
    selectedDevices: {
      speaker: null,
      microphone: null,
      camera: null,
    },
    realSelectedDevices: {
      speaker: null,
      microphone: null,
      camera: null,
    },
    collectAnalytics: heykaStore.get('collectAnalytics', true),
    privacyLogs: [],
    microphoneVolume: -100,
    notifications: [],
    pushes: [],
    search: '',
    animationChannel: null,
  };
};

export default state();
