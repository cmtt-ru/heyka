import StreamReceiver from '@classes/StreamSharing/Receiver';

/**
 * Manage video streams for CallWindow (Grid and Expanded view)
 * @class
 */
class CommonStreams {
  /**
   * Prepare instance
   */
  constructor() {
    this.streams = {};
    this.streamReceiver = new StreamReceiver({ debug: process.env.VUE_APP_JANUS_DEBUG === 'true' });
    this.streamReceiver.on('connection-closed', this.onConnectionClosed.bind(this));
  }

  /**
   * Return stream of given user
   * @param {string} userId User id
   * @returns {promise<MediaStream>}
   */
  async getStream(userId) {
    if (this.streams[userId]) {
      if (this.streams[userId].stream) {
        return this.streams[userId].stream;
      }
      if (this.streams[userId].waitStream) {
        return this.getWaitStreamPromise(userId);
      }
    } else {
      this.streams[userId] = {
        waitStream: true,
      };
      console.log('wait stream here');

      this.streamReceiver.requestStream(userId);

      return this.getWaitStreamPromise(userId);
    }
  }

  /**
   * Returns promise that resolves when stream is received
   * @param {string} userId User id
   * @returns {promise<MediaStream>}
   */
  getWaitStreamPromise(userId) {
    return new Promise(resolve => {
      this.streamReceiver.once('new-stream', data => {
        if (data.userId === userId) {
          resolve(data.stream);
          if (!this.streams[userId]) {
            this.streams[userId] = {};
          }
          this.streams[userId].stream = data.stream;
          delete this.streams[userId].waitStream;
        }
      });
    });
  }

  /**
   * Handle connection closed
   * @param {string} userId User id
   * @returns {void}
   */
  onConnectionClosed(userId) {
    delete this.streams[userId];
  }
}

export default new CommonStreams();