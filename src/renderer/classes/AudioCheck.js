import store from '@/store';
import hark from 'hark';

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

    this.harkInstance = hark(this.mediaStream, {});

    this.harkInstance.on('volume_change', (db) => {
      this.microphoneVolume = db;
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
    const MUTE_VOL = -100;

    let vol = await store.state.app.microphoneVolume;

    console.log(vol);

    const checkDelay = 1000; // milliseconds

    await new Promise(resolve => setTimeout(resolve, checkDelay));

    vol = await store.state.app.microphoneVolume;

    console.log(vol);

    if (vol === MUTE_VOL) {
      //! can be a problem with audio Permission!
      const notification = {
        data: {
          text: `No audio detected. Maybe restart system?`,
          buttons: [
            {
              text: 'OK',
              type: 1,
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