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
 *
 * @property {ConnectionStatus} connectionStatus - several connection status
 *
 * @property {number} miniChatLastMessageTimestamp - last mini chat message timestamp
 */

/**
 * @typedef {object} ConnectionStatus
 * @property {boolean} internet – internet status
 * @property {boolean} api – backend API status
 * @property {boolean} socket – socket connection status
 * @property {boolean} janus – janus connection status
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
    appVersion: window.ipcRenderer.sendSync('remote-getVersion'),
    language: heykaStore.getSync('language', 'en'),
    runAppFrom: heykaStore.getSync('runAppFrom', 'window'),
    autorun: heykaStore.getSync('autorun', true),
    resizeWindow: heykaStore.getSync('resizeWindow', false),
    muteMic: heykaStore.getSync('muteMic', false),
    muteHotkey: heykaStore.getSync('muteHotkey', true),
    closeOverlayButton: heykaStore.getSync('closeOverlayButton', true),
    devServer: heykaStore.getSync('devServer', false),
    showMoreChannels: heykaStore.getSync('showMoreChannels', true),
    theme: heykaStore.getSync('theme', {
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
    collectAnalytics: heykaStore.getSync('collectAnalytics', true),
    privacyLogs: [],
    microphoneVolume: -100,
    notifications: [],
    modals: [],
    pushes: [],
    search: '',
    animationChannel: null,
    connectionStatus: {
      visible: true,
      internet: true,
      api: false,
      socket: false,
      janus: false,
    },
    miniChatLastReadTimestamp: 0,
  };
};

export default state();
