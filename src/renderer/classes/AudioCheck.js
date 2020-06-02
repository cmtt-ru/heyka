import { EventEmitter } from 'events';
import store from '@/store';
import hark from 'hark';
import shutdown from 'electron-shutdown-command';
import router from '@/router';
import i18n from '@/i18n';

const texts = i18n.t('notifications');

const { systemPreferences } = require('electron').remote;

/**
 * Audio element for audio test
 * @type {HTMLAudioElement}
 */
const audioTest = new Audio(require('@assets/audio/test-sound.mp3'));

/**
 * Class for detecting AudioTrouble
 */
class AudioCheck extends EventEmitter {
  /**
 * Init checker
 */
  constructor() {
    super();
    this._changeDevice();
    this.__mediaStream = null;
    this.__harkInstance = null;
  }

  /**
     * List of all devices
     * @returns {object}
     */
  _devices() {
    return store.getters['app/getDevices'];
  }

  /**
     * List of selected devices
     * @returns {object}
     */
  _selectedDevices() {
    return store.getters['app/getSelectedDevices'];
  }

  /**
     * Selected microphone model
     * @returns {object}
     */
  _selectedMicrophone() {
    return this._selectedDevices().microphone;
  }

  /**
     * Change's device for test sound and microphone volume test
     * @return {void}
     */
  async _changeDevice() {
    this.destroyMediaStream();

    this.__mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: this._selectedMicrophone,
      },
    });

    audioTest.setSinkId(this._selectedDevices().speaker);

    this.__harkInstance = hark(this.__mediaStream, {
      interval: 100,
    });

    this.__harkInstance.on('volume_change', (db) => {
      this.microphoneVolume = db;
      this.emit('volume_change', db);
    });
  }

  /**
   * Destroy's hark instance and media stream
   * @returns {void}
   */
  destroyMediaStream() {
    if (this.__harkInstance) {
      this.__harkInstance.stop();
    }

    if (this.__mediaStream) {
      this.__mediaStream.getTracks().forEach(track => track.stop());
    }
  }

  /**
     * Play test sound
     * @returns {void}
     */
  playTestSound() {
    audioTest.play();
  }

  /**
 * Check audio troubles
 * @returns {void}
 */
  async checkAudio() {
    if (this._checkNoMic()) {
      return true;
    };

    const checkDelay = 100; // milliseconds
    const sufficientAmount = 20; // times
    const vol1 = this.microphoneVolume;

    for (let i = 0; i < sufficientAmount; i++) {
      await new Promise(resolve => setTimeout(resolve, checkDelay));
      if (this.microphoneVolume !== vol1) {
        return true;
      }
    }

    if (this._checkNoPermission()) {
      return true;
    };
    this._checkNoSound();
  }

  /**
   * Check if user doesn't have any mic available
   * @returns {void}
   */
  async _checkNoMic() {
    if (this._devices().microphones.length === 0) {
      const notification = {
        data: {
          text: texts.nomic.text,
          buttons: [
            {
              text: texts.nomic.button1,
              type: 1,
              close: true,
            },
          ],
        },
      };

      await store.dispatch('app/addNotification', notification);

      return true;
    } else {
      return false;
    };
  }

  /**
   * Check if user has somehow no sound detected (but has connected mic)
   * @returns {void}
   */
  async _checkNoSound() {
    console.log(this._devices().microphones);
    if (this._devices().microphones.length === 2) {
      const notification = {
        data: {
          text: texts.othermic.text,
          buttons: [
            {
              text: texts.othermic.button1,
              type: 1,
              action: () => {
                router.push({ name: 'settings-devices' });
              },
            },
            {
              text: texts.othermic.button2,
              close: true,
            },
          ],
        },
      };

      await store.dispatch('app/addNotification', notification);
    } else {
      const notification = {
        data: {
          text: texts.noaudio.text,
          buttons: [
            {
              text: texts.noaudio.button1,
              type: 12,
              action: () => {
                //! asks password on mac!
                shutdown.reboot({ sudo: true });
              },
            },
            {
              text: texts.noaudio.button2,
              type: 1,
              close: true,
            },
          ],
        },
      };

      await store.dispatch('app/addNotification', notification);
    }
  }

  /**
   * Check if user didn't give any permission to use his mic
   * @returns {void}
   */
  async _checkNoPermission() {
    if (process.platform !== 'darwin') {
      return false;
    }
    if (systemPreferences.getMediaAccessStatus('microphone') === 'restricted' || systemPreferences.getMediaAccessStatus('microphone') === 'denied') {
      const notification = {
        data: {
          text: texts.nomicpermission.text,
          buttons: [
            {
              text: texts.nomicpermission.button1,
              type: 1,
              action: () => {
                window.open('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone', '_blank');
              },
            },
            {
              text: texts.nomicpermission.button2,
              close: true,
            },
          ],
        },
      };

      await store.dispatch('app/addNotification', notification);

      return true;
    } else {
      return false;
    };
  }
}

export default new AudioCheck();
