import { EventEmitter } from 'events';
import store from '@/store';
import hark from 'hark';
import shutdown from 'electron-shutdown-command';
import router from '@/router';
import i18n from '@sdk/translations/i18n';
import { ipcRenderer } from 'electron';
import broadcastEvents from '@classes/broadcastEvents';

const texts = i18n.t('notifications');

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
    this.__mediaStream = null;
    this.__harkInstance = null;
    this.__needMediaStream = false;
    this.__skipMutedTalk = false;

    store.watch(() => store.getters['app/getSelectedDevices'], n => {
      if (this.__needMediaStream) {
        this.startMediaStream();
      }
    });

    broadcastEvents.on('audio-check-skip-muted-talk', () => {
      this.__skipMutedTalk = true;
    });
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
     * Start media stream for microphone volume test
     * @return {void}
     */
  async startMediaStream() {
    this.destroyMediaStream();

    this.__needMediaStream = true;

    if (this._selectedMicrophone() === null) {
      return;
    }

    this.__mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: this._selectedMicrophone(),
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

    this.__needMediaStream = true;
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
   * @returns {boolean}
   */
  async checkAudio() {
    if (this._checkNoMic()) {
      return true;
    }

    this.startMediaStream();

    const checkDelay = 100; // milliseconds
    const sufficientAmount = 20; // times
    const vol1 = this.microphoneVolume;

    for (let i = 0; i < sufficientAmount; i++) {
      await new Promise(resolve => setTimeout(resolve, checkDelay));
      if (this.microphoneVolume !== vol1) {
        this.destroyMediaStream();

        return true;
      }
    }

    if (this._checkNoPermission()) {
      this.destroyMediaStream();

      return true;
    }

    this.destroyMediaStream();

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
    }
  }

  /**
   * Check if user has somehow no sound detected (but has connected mic)
   * @returns {void}
   */
  async _checkNoSound() {
    if (this._devices().microphones.length > 2) {
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
    if (!IS_MAC) {
      return false;
    }

    const micState = ipcRenderer.sendSync('remote-systemPreferences-microphone');

    if (micState === 'restricted' || micState === 'denied') {
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
    }
  }

  /**
   * Subscribe to 'louder than minLevel' event
   * @returns {void}
   */
  async subscribeMutedTalk() {
    if (this.__skipMutedTalk === false) {
      await this.startMediaStream();
      this.subscribeMutedTalk.talkingLevel = -100;
      const minLevel = -42; // speak louder and you'll get notification

      this.__harkInstance.on('volume_change', (db) => {
        this.subscribeMutedTalk.talkingLevel = (this.subscribeMutedTalk.talkingLevel + db) / 2;
        if (this.subscribeMutedTalk.talkingLevel > minLevel) {
          this.showTakingMutedNotification();
          this.destroyMediaStream();
        }
      });
    } else {
      this.__skipMutedTalk = false;
    }
  }

  /**
   * Display 'No one hears you' push
   * @returns {void}
   */
  async showTakingMutedNotification() {
    const push = {
      inviteId: Date.now().toString(),
      local: true,
      message: { action: 'muted' },
    };

    await store.dispatch('app/addPush', push);
  }
}

export default new AudioCheck();
