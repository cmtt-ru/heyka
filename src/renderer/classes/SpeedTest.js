/* eslint-disable require-jsdoc */
import { EventEmitter } from 'events';
import JanusEvents from './janusEvents';
import API from '@api';

const TEST_DATA_SIZE = 20000000;
const MAX_API_TIME = 2000;
const CHECK_AMOUNT = 3;
// const CRITICAL_DELTA = 0.4;
const MAX_TIME = 10000;
// const MIN_TIME = 1000;

/**
 * Class for testing network speed.
 */
class SpeedTest extends EventEmitter {
  constructor() {
    super();
    this.uploadBitrate = 1000000;
    this.checkUpload();
    this.uploadSpeed = null;
    this.uploadTimeout = null;

    JanusEvents.on('joined', () => {
      console.log('joined, from speedtest');
    });
    JanusEvents.on('bitrate', (bitrate) => {
      console.log(bitrate.outvalue);
    });
  }

  async checkUpload() {
    const speed = await this.checkSpeed('upload');

    console.log('Upload: ', speed, 'MB/s');
    this.uploadSpeed = speed;
    this.uploadTimeout = setTimeout(() => {
      this.checkUpload();
    }, MAX_TIME);
  }

  async checkDownload() {
    const speed = await this.checkSpeed('download');

    console.log('Download: ', speed, 'MB/s');
  }

  async checkSpeed(type, amount = CHECK_AMOUNT) {
    const times = [];

    for (let i = 0; i < amount; i++) {
      const t0 = performance.now();

      if (type === 'upload') {
        let formData = new FormData();

        formData.append('data', this.generateRandomData());
        await API.app.checkUpload(formData);
        formData = null;
      } else {
        await API.app.checkDownload();
      }
      const t1 = performance.now();

      if (t1 - t0 > MAX_API_TIME) {
        return TEST_DATA_SIZE / (t1 - t0);
      }

      times.push(Math.floor(t1 - t0));
    }
    // console.log(times);
    const time = times.reduce((a, b) => a + b, 0) / amount;
    const speed = TEST_DATA_SIZE / time;

    return speed;
  }

  generateRandomData() {
    return new Blob([ new ArrayBuffer(TEST_DATA_SIZE) ], { type: 'multipart/form-data' });
  };
}

export default new SpeedTest();