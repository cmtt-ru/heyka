import { EventEmitter } from 'events';
import { desktopCapturer } from 'electron';

const THUMBNAIL_SIZE = 150;

/**
 * Class for media capturer.
 * Can capture screens, windows & webcameras
 */
class MediaCapturer extends EventEmitter {
  /**
   * Device constructor
   */
  constructor() {
    super();
    this.a = 1;
  }

  /**
   * Get media sources
   *
   * @param {string} type – source type. Can be 'screen' or 'window'
   * @param {number} [thumbnailSize] – thumbnail size
   * @returns {Promise<Electron.DesktopCapturerSource[]>}
   */
  async getSources(type, thumbnailSize = THUMBNAIL_SIZE) {
    const sources = await desktopCapturer.getSources({
      types: [
        type,
      ],
      thumbnailSize: {
        width: thumbnailSize,
        height: thumbnailSize,
      },
    });

    return sources;
  }

  /**
   * Get media stream by source id
   *
   * @param {string} sourceId – source id
   * @returns {Promise<MediaStream>}
   */
  async getStream(sourceId) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: 0,
          minHeight: 0,
          maxWidth: 1920,
          maxHeight: 1920,
        },
      },
    });

    return stream;
  }

  /**
   * Get camera stream
   *
   * @returns {Promise<MediaStream>}
   */
  async getCameraStream() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });

    return stream;
  }

  /**
   * Destroy active stream
   *
   * @param {MediaStream} stream – media stream
   * @returns {void}
   */
  destroyStream(stream) {
    stream.getVideoTracks().forEach(track => {
      track.stop();
    });
  }
}

export default new MediaCapturer();
