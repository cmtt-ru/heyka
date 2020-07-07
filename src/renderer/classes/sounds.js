/**
 * Class for play different sounds
 */
class Sounds {
  /**
   * Sound constructor
   */
  constructor() {
    this.sounds = {
      'me-joined': new Audio(require('@assets/audio/me-joined.mp3')),
      'user-joined': new Audio(require('@assets/audio/user-joined.mp3')),
      push: new Audio(require('@assets/audio/push.mp3')),
      mute: new Audio(require('@assets/audio/mute.mp3')),
      unmute: new Audio(require('@assets/audio/unmute.mp3')),
    };
  }

  /**
   * Play specific sound
   * @param {string} soundName – sound name
   * @returns {void}
   */
  play(soundName) {
    const sound = this.sounds[soundName];

    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }

  /**
   * Set output device id
   * @param {string} deviceId – device id
   * @returns {void}
   */
  setSinkId(deviceId) {
    for (const soundName in this.sounds) {
      this.sounds[soundName].setSinkId(deviceId);
    }
  }
}

export default new Sounds();
