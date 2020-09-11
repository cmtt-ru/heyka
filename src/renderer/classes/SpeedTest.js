/* eslint-disable require-jsdoc */
import { EventEmitter } from 'events';
import JanusEvents from './janusEvents';

const MEAN_COUNT = 8;

const TEST_COUNT = 30;

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
    this.connectionInfo = [];
    this.lostPackets = false;
    this.gotAwful = false;
    this.gotBad = false;
    this.gotMedium = false;

    if (window.hawk) {
      JanusEvents.on('bitrate', (bitrate) => {
        this.addBitrate({ ...bitrate });
      });
      JanusEvents.on('left', () => {
        this.bitrates = [];
        this.lostPackets = false;
        this.gotAwful = false;
        this.gotBad = false;
        this.gotMedium = false;
      });

      JanusEvents.on('submit-data', () => {
        window.hawk.send(new Error(`User submitted bitrate data`), this.connectionInfo);
      });
    }
  }

  addBitrate(val) {
    this.bitrates = this.bitrates.slice(-MEAN_COUNT);
    this.bitrates.push(val);

    // gather info from last 30 secs
    this.connectionInfo = this.connectionInfo.slice(-TEST_COUNT);
    this.connectionInfo.push(`OUTPUT: ${val.outvalueInt}, INPUT: ${val.valueInt}, LOST PACKETS: ${val.lostPackets - val.lostPacketsBefore}`);

    this.testBitrateDrop();
    this.testLostPackets(val);
  }

  testBitrateDrop() {
    if (this.bitrates.length < TEST_COUNT / 2) {
      return;
    }

    const meanbitrate = this.simpleMean(this.bitrates, 'outvalueInt');

    if (meanbitrate <= AWFUL_BITRATE && !this.gotAwful) {
      window.hawk.send(new Error(`AWFUL BITRATE (<${AWFUL_BITRATE})`), this.connectionInfo);
      this.gotAwful = true;
    } else if (meanbitrate <= BAD_BITRATE && !this.gotBad) {
      window.hawk.send(new Error(`BAD BITRATE (<${BAD_BITRATE})`), this.connectionInfo);
      this.gotBad = true;
    } else if (meanbitrate <= MEDIUM_BITRATE && !this.gotMedium) {
      window.hawk.send(new Error(`MEDIUM BITRATE (<${MEDIUM_BITRATE})`), this.connectionInfo);
      this.gotMedium = true;
    }
  }

  simpleMean(values, key) {
    values = values.filter(el => el[key]).map(el => el[key]);

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    return mean;
  }

  testLostPackets(bitrate) {
    if (bitrate.lostPackets - bitrate.lostPacketsBefore > 1 && !this.lostPackets) {
      this.lostPackets = true;
      window.hawk.send(new Error(`packet loss`), this.connectionInfo);
    }
  }
}

export default new SpeedTest();