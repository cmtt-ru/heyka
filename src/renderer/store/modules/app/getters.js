import UAParser from 'ua-parser-js';
import i18n from '@sdk/translations/i18n';
import { heykaStore } from '@/store/localStore';

const parsedUserAgent = new UAParser().getResult();

export default {
  /**
   * Get general app info (name, ver, operating system etc.)
   *
   * @param {AppState} state – module app state
   * @returns {string}
   */
  getGeneralInfo: (state) => {
    return {
      name: state.appName,
      version: state.appVersion,
      system: parsedUserAgent.os.name,
      systemVer: parsedUserAgent.os.version,
    };
  },

  /**
   * Get devices
   *
   * @param {AppState} state – module app state
   * @returns {string}
   */
  getDevices: (state) => {
    const devices = {};
    const defaultLabel = i18n.t('settings.devices.defaultDevice');

    Object.keys(state.devices).forEach((key) => {
      devices[key] = state.devices[key].map(d => {
        return {
          name: d.label === 'Default' ? defaultLabel : d.label,
          value: d.id,
        };
      });
    });

    return devices;
  },

  /**
   * Get specific device by id
   *
   * @param {ChannelState} state – channels module state
   * @returns {object}
   */
  getDevice: state => (deviceType, deviceId) => {
    const devices = state.devices[`${deviceType}s`];

    if (devices) {
      const specificDevice = devices.find(d => d.id === deviceId);

      if (specificDevice) {
        return specificDevice;
      }
    }

    return null;
  },

  /**
   * Get specific device by label
   *
   * @param {ChannelState} state – channels module state
   * @returns {object}
   */
  getDeviceByLabel: state => (deviceType, deviceLabel) => {
    const devices = state.devices[`${deviceType}s`];

    if (devices) {
      const specificDevice = devices.find(d => d.rawLabel === deviceLabel);

      if (specificDevice) {
        return specificDevice;
      }
    }

    return null;
  },

  /**
   * Get selected devices
   *
   * @param {AppState} state – module app state
   * @returns {object}
   */
  getSelectedDevices: (state) => state.selectedDevices,

  /**
   * Get mic volume
   *
   * @param {AppState} state – module app state
   * @returns {object}
   */
  getMicrophoneVolume: (state) => state.microphoneVolume,

  /**
   * Get fluent channel id (for animations!)
   *
   * @param {AppState} state – module app state
   * @returns {object}
   */
  getAnimationChannel: (state) => state.animationChannel,

  /**
   * Get pushes
   *
   * @param {AppState} state – module app state
   * @returns {object}
   */
  getPushes: (state) => state.pushes,

  /**
   * Load specific device from storage and return it's value
   *
   * @param {AppState} state – vuex app state
   * @param {object} getters – vuex getters
   * @returns {function(*): any}
   */
  loadSelectedDevice: (state, getters) => (deviceType) => {
    const deviceTypeCapitalized = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
    let deviceId = heykaStore.get(`selected${deviceTypeCapitalized}`, 'default');
    let device = getters.getDevice(deviceType, deviceId);

    if (!device) {
      const deviceLabel = heykaStore.get(`selected${deviceTypeCapitalized}Label`);

      device = getters['getDeviceByLabel'](deviceType, deviceLabel);

      if (device) {
        deviceId = device.id;
      } else {
        deviceId = 'default';
      }
    }

    return deviceId;
  },

  getConnectionStatus: state => {
    if (state.connectionStatus.visible) {
      return state.connectionStatus.internet && state.connectionStatus.api && state.connectionStatus.socket;
    }

    return true;
  },

};
