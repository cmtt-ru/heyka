import store from '@/store';
import hark from 'hark';
const { systemPreferences } = require('electron').remote;

/**
 * Audio element for audio test
 * @type {HTMLAudioElement}
 */
const audioTest = new Audio(require('@assets/audio/test-sound.mp3'));

/**
 * Class for detecting AudioTrouble
 */
class AudioCheck {
  /**
 * Init checker
 */
  constructor() {
    this._changeDevice();
    this.mediaStream = null;
    this.harkInstance = null;
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

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: this._selectedMicrophone,
      },
    });

    audioTest.setSinkId(this._selectedDevices().speaker);

    this.harkInstance = hark(this.mediaStream, {
      interval: 1000,
      threshold: -100,
    });

    this.harkInstance.on('volume_change', (db) => {
      this.microphoneVolume = db;
      // console.log(db);
    });
  }

  /**
   * Destroy's hark instance and media stream
   * @returns {void}
   */
  destroyMediaStream() {
    if (this.harkInstance) {
      this.harkInstance.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
  }

  /**
 * Check audio troubles
 * @returns {void}
 */
  async checkAudio() {
    const checkDelay = 1100; // milliseconds
    const vol1 = this.microphoneVolume;

    await new Promise(resolve => setTimeout(resolve, checkDelay));
    const vol2 = this.microphoneVolume;

    if (vol1 === vol2) {
      await this.__checkNoPermission();
      await this.__checkNoSound();
    }
  }

  /**
   * Check if user doesn't have any mic available
   * @returns {void}
   */
  __checkNoMic() {

  }

  /**
   * Check if user has somehow no sound detected (but has connected mic)
   * @returns {void}
   */
  async __checkNoSound() {
    const notification = {
      data: {
        text: `No audio detected. Maybe restart system?`,
        buttons: [
          {
            text: 'Restart',
            type: 12,
            //! add restart functionality?
          },
          {
            text: 'Discard',
            type: 1,
            close: true,
          },
        ],
      },
    };

    await store.dispatch('app/addNotification', notification);
  }

  /**
   * Check if user didn't give any permission to use his mic
   * @returns {void}
   */
  async __checkNoPermission() {
    if (process.platform !== 'darwin') {
      return false;
    }
    if (systemPreferences.getMediaAccessStatus('microphone') !== 'granted') {
      const notification = {
        data: {
          text: `You didn't give us access to mic. Go to Apple menu > System Preferences > Security & Privacy > Privacy > Microphone`,
          buttons: [
            {
              text: 'OK',
              close: true,
            },
          ],
        },
      };

      await store.dispatch('app/addNotification', notification);
    }
  }
}

export default new AudioCheck();