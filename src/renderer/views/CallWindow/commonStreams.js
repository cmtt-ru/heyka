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
}

export default new CommonStreams();