import { EventEmitter } from 'events';

/**
 * Change event debounce timeout
 * @type {number}
 */
const DEBOUNCE_TIMEOUT = 500;

/**
 * Class for device management
 */
class MediaDevices extends EventEmitter {
  /**
   * Device constructor
   */
  constructor() {
    super();

    this.devices = {
      microphones: [],
      speakers: [],
      cameras: [],
    };

    navigator.mediaDevices.addEventListener('devicechange', this.deviceChangeHandler.bind(this));

    this.updateDevices();
  }

  /**
   * Device change handler
   *
   * @return {Promise<void>}
   */
  async deviceChangeHandler() {
    await this.updateDevices();
  }

  /**
   * Updates devices list
   *
   * @return {Promise<void>}
   */
  async updateDevices() {
    this.devices = await this.getDevices();

    clearInterval(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      const defaultMicrophone = this.devices.microphones.find((a) => a.id === 'default');

      this.emit('change', this.devices);

      if (defaultMicrophone.bluetooth) {
        this.emit('bluetooth-microphone', defaultMicrophone);
      }
    }, DEBOUNCE_TIMEOUT);
  }

  /**
   * Get normalized media devices
   *
   * @return {Promise<{cameras: [], microphones: [], speakers: []}>}
   */
  async getDevices() {
    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    const devices = {
      microphones: [],
      speakers: [],
      cameras: [],
    };

    for (const device of mediaDevices) {
      const label = device.label.toLowerCase();
      const newDevice = {
        label: device.label,
        rawLabel: device.label,
        id: device.deviceId,
        bluetooth: false,
      };

      /** Look for bluetooth word in label */
      newDevice.bluetooth = label.indexOf('bluetooth') > -1;

      /**
       * Remove all unnecessary words in brackets
       * @example:
       * FaceTime HD Camera (Built-in) (05ac:8514)
       * becomes:
       * FaceTime HD Camera
       */
      // newDevice.label = newDevice.label.replace(/\s*\(.+/gi, '');

      /** Rename default device to Default */
      if (device.deviceId === 'default') {
        newDevice.label = 'Default';
      }

      /** Categorize devices */
      if (device.kind === 'audioinput') {
        devices.microphones.push(newDevice);
      } else if (device.kind === 'audiooutput') {
        devices.speakers.push(newDevice);
      } else if (device.kind === 'videoinput') {
        devices.cameras.push(newDevice);
      }
    }

    return devices;
  }
}

export default new MediaDevices();
