import StreamReceiver from '@classes/StreamSharing/Receiver';
import mediaCapturer from './mediaCapturer';
import { EventEmitter } from 'events';

/**
 * Manage video streams for CallWindow (Grid and Expanded view)
 * @class
 */
class CommonStreams extends EventEmitter {
  /**
   * Prepare instance
   */
  constructor() {
    super();

    this.streams = {};
    this.streamReceiver = new StreamReceiver({ debug: process.env.VUE_APP_JANUS_DEBUG === 'true' });
    this.streamReceiver.on('connection-closed', this.onConnectionClosed.bind(this));
    this.streamReceiver.on('clear-all', this.onClearAll.bind(this));
  }

  /**
   * Return stream of given user
   * @param {string} userId User id
   * @returns {promise<MediaStream>}
   */
  async getStream(userId) {
    if (this.streams[userId]) {
      if (this.streams[userId].stream) {
        this._debug(`Return prepared stream for ${userId}`);

        return this.streams[userId].stream;
      }
      if (this.streams[userId].waitStream) {
        this._debug(`Return promise which resolves with stream ${userId}`);

        return this.getWaitStreamPromise(userId);
      }
    } else {
      this.streams[userId] = {
        waitStream: true,
      };
      this._debug(`Prepare promise and return it ${userId}`);

      this.streamReceiver.requestStream(userId);

      return this.getWaitStreamPromise(userId);
    }
  }

  /**
   * Clear stream for specific user
   * @param {string} userId User id
   * @returns {void}
   */
  clearStream(userId) {
    if (this.streams[userId]) {
      mediaCapturer.destroyStream(this.streams[userId].stream);
      delete this.streams[userId];
    }
  }

  /**
   * Returns promise that resolves when stream is received
   * @param {string} userId User id
   * @returns {promise<MediaStream>}
   */
  getWaitStreamPromise(userId) {
    return new Promise((resolve) => {
      this.streamReceiver.once(`new-stream-${userId}`, data => {
        this._debug(`New stream for ${userId}`);
        resolve(data.stream);
        if (!this.streams[userId]) {
          this.streams[userId] = {};
        }
        this.streams[userId].stream = data.stream;
        delete this.streams[userId].waitStream;
      });
    });
  }

  /**
   * Handle connection closed
   * @param {string} userId User id
   * @returns {void}
   */
  onConnectionClosed(userId) {
    console.log(`Connection closed for ${userId}`);
    if (this.streams[userId] && this.streams[userId].stream) {
      mediaCapturer.destroyStream(this.streams[userId].stream);
    }
    delete this.streams[userId];
    this.emit('stream-canceled', userId);
  }

  /**
   * Handles event clear all streams
   * @returns {void}
   */
  onClearAll() {
    this._debug('clean up all streams');
    Object.keys(this.streams).forEach(key => {
      if (this.streams[key].stream) {
        mediaCapturer.destroyStream(this.streams[key].stream);
      }
      delete this.streams[key];
    });
  }

  /**
   * Inner debug tool
   * @returns {void}
   */
  _debug() {
    console.log(`commonStreams: `, ...arguments);
  }
}

export default new CommonStreams();