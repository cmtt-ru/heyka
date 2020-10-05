import OS from 'os';
import i18n from '@sdk/translations/i18n';
import { heykaStore } from '@/store/localStore';

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
      system: OS.type(), // TODO: make prettier
      systemVer: OS.release(),
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
   * Get specific device
   *
   * @param {ChannelState} state – channels module state
   * @returns {object}
   */
  getDevice: state => (deviceType, deviceId) => {
    const devices = state.devices[deviceType];

    if (devices) {
      const specificDevice = devices.find(d => d.id === deviceId);

      if (specificDevice) {
        return specificDevice;
      }
    }

    return null;
  },

  loadSelectedDevice: (state, getters) => (deviceType) => {
    const deviceTypeCapitalized = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
    let deviceId = heykaStore.get(`selected${deviceTypeCapitalized}`, 'default');
    let device = getters['getDevice'](`${deviceType}s`, deviceId);

    device = '';

    if (!device) {
      const deviceLabel = heykaStore.get(`selected${deviceTypeCapitalized}Label`, 'default');

      device = getters['getDeviceByLabel'](`${deviceType}s`, deviceLabel);

      if (device) {
        deviceId = device.id;
      } else {
        deviceId = 'default';
      }
    }

    console.log(deviceType, deviceId);

    return deviceId;
  },

  /**
   * Get specific device by label
   *
   * @param {ChannelState} state – channels module state
   * @returns {object}
   */
  getDeviceByLabel: state => (deviceType, deviceLabel) => {
    const devices = state.devices[deviceType];

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
   * Get pushes
   *
   * @param {AppState} state – module app state
   * @returns {object}
   */
  getPushes: (state) => state.pushes,

};
