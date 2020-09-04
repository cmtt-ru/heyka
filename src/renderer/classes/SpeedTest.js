/* eslint-disable require-jsdoc */
import { EventEmitter } from 'events';
import JanusEvents from './janusEvents';
// import API from '@api';

// const TEST_DATA_SIZE = 20000000;
// const MAX_API_TIME = 2000;
// const CHECK_AMOUNT = 3;
// const CRITICAL_DELTA = 0.4;
// const MAX_TIME = 10000;
// const MIN_TIME = 1000;

const TEST_TIME = 6;

const MEDIUM_BITRATE = 25;
const BAD_BITRATE = 20;
const AWFUL_BITRATE = 10;

/**
 * Class for testing network speed.
 */
class SpeedTest extends EventEmitter {
  constructor() {
    super();

    this.bitrates = [];

    JanusEvents.on('joined', () => {
      // console.log('joined, from speedtest');
    });
    JanusEvents.on('bitrate', (bitrate) => {
      this.addBitrate({ ...bitrate });
    });
    JanusEvents.on('left', () => {
      this.bitrates = [];
    });
  }

  addBitrate(val) {
    this.bitrates = this.bitrates.slice(-TEST_TIME);
    this.bitrates.push(val);
    this.testBitrateDrop();
  }

  testBitrateDrop() {
    if (!window.hawk || this.bitrates.length < TEST_TIME) {
      return;
    }

    const meanbitrate = this.simpleMean(this.bitrates, 'outvalueInt');

    // console.log('MEAN BITRATE:', meanbitrate);

    if (meanbitrate <= AWFUL_BITRATE) {
      window.hawk.send(new Error('AWFUL BITRATE (<10)'), this.bitrates);
    } else if (meanbitrate <= BAD_BITRATE) {
      window.hawk.send(new Error('BAD BITRATE (<20)'), this.bitrates);
    } else if (meanbitrate <= MEDIUM_BITRATE) {
      window.hawk.send(new Error('MEDIUM BITRATE (<25)'), this.bitrates);
    }
  }

  simpleMean(values, key) {
    values = values.filter(el => el[key]).map(el => el[key]);

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    return mean;
  }

  // async checkUpload() {
  //   const speed = await this.checkSpeed('upload');

  //   console.log('Upload: ', speed, 'MB/s');
  //   this.uploadSpeed = speed;
  //   this.uploadTimeout = setTimeout(() => {
  //     this.checkUpload();
  //   }, MAX_TIME);
  // }

  // async checkDownload() {
  //   const speed = await this.checkSpeed('download');

  //   console.log('Download: ', speed, 'MB/s');
  // }

  // async checkSpeed(type, amount = CHECK_AMOUNT) {
  //   const times = [];

  //   for (let i = 0; i < amount; i++) {
  //     const t0 = performance.now();

  //     if (type === 'upload') {
  //       let formData = new FormData();

  //       formData.append('data', this.generateRandomData());
  //       await API.app.checkUpload(formData);
  //       formData = null;
  //     } else {
  //       await API.app.checkDownload();
  //     }
  //     const t1 = performance.now();

  //     if (t1 - t0 > MAX_API_TIME) {
  //       return TEST_DATA_SIZE / (t1 - t0);
  //     }

  //     times.push(Math.floor(t1 - t0));
  //   }
  //   const time = times.reduce((a, b) => a + b, 0) / amount;
  //   const speed = TEST_DATA_SIZE / time;

  //   return speed;
  // }

  // generateRandomData() {
  //   return new Blob([ new ArrayBuffer(TEST_DATA_SIZE) ], { type: 'multipart/form-data' });
  // };
}

export default new SpeedTest();