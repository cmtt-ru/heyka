import { EventEmitter } from 'events';
import broadcastEvents from '../broadcastEvents';
import mediaCapturer from '../mediaCapturer';
import Logger from '@classes/logger';
const cnsl = new Logger('Reciever.js', '#34495E');

const VIDEO_BITRATE = 512;

/**
 * StreamSharingReceiver`
 * Manages sharing media streams on receiver side
 * @class
 */
export default class StreamSharingReceiver extends EventEmitter {
  /**
   * Init stream sharing manager
   */
  constructor() {
    super();

    this.__pcs = {};
    broadcastEvents.on('stream-sharing-closed', this._streamSharingClosed.bind(this));
    broadcastEvents.on('clear-all', this._onClearAll.bind(this));
  }

  /**
   * Requests stream of given user from main window
   * @param {string} userId Which user you want to request stream
   * @returns {void}
   */
  requestStream(userId) {
    const data = {
      // eslint-disable-next-line
      requestId: `${Math.floor(Math.random() * 9999 + 10000)}`,
      userId,
    };

    if (this.__pcs[userId]) {
      this._streamSharingClosed(userId);
    }

    const pc = new RTCPeerConnection();

    const onIceCandidate = e => {
      if (!e.candidate) {
        return;
      }

      cnsl.debug(`ice-candidate ${data.requestId}`, e.candidate.toJSON());

      // send ICE candidate to another window
      broadcastEvents.dispatch(`icecandidate-receiver-${data.requestId}`, {
        type: 'candidate',
        candidate: e.candidate.toJSON(),
      });
    };

    const onIceConnectionStateChange = e => {
      cnsl.debug(`ice-state ${data.requestId}`, pc.iceConnectionState);
      if (pc && (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected')) {
        this._streamSharingClosed(userId, data.requestId);
      }
    };

    const onTrack = track => {
      cnsl.info(`Got track for ${userId}! `);
      cnsl.debug(`Cought track from RTCPeerConnection ${data.requestId}: `, track);
      // notify about new received stream
      this.emit(`new-stream-${userId}`, {
        userId,
        stream: track.streams[0],
      });

      this.__pcs[userId].mediaStream = track.streams[0];
    };

    this.__pcs[userId] = {
      requestId: data.requestId,
      pc,
      onTrack,
      onIceConnectionStateChange,
      onIceCandidate,
    };

    // subscribe for ICE candidate
    pc.addEventListener('icecandidate', onIceCandidate);
    // Handle ICE connection state change
    pc.addEventListener('iceconnectionstatechange', onIceConnectionStateChange);
    // Handle new track of the connection
    pc.addEventListener('track', onTrack);

    // handle offer from main window
    broadcastEvents.once(`stream-offer-host-${data.requestId}`, async (d) => {
      cnsl.debug(`offer ${data.requestId}`, d);
      await pc.setRemoteDescription(d.sdpOffer);
      let answer = await pc.createAnswer();

      await pc.setLocalDescription(answer);

      const sdp = this._setMediaBitrate(answer.sdp, 'video', VIDEO_BITRATE);

      // send answer
      broadcastEvents.dispatch(`sdp-answer-receiver-${data.requestId}`, {
        sdpAnswer: {
          sdp: sdp,
          type: 'answer',
        },
      });

      answer = null;
    });

    // handle ICE candidates from stream host
    broadcastEvents.on(`icecandidate-host-${data.requestId}`, async (evt) => {
      cnsl.debug(`add ice candidate ${data.requestId}`, evt);
      await pc.addIceCandidate(evt.candidate);
    });

    // Request stream
    broadcastEvents.dispatch('request-stream', data);
    console.log('---------', 'request-stream', data);
    broadcastEvents.once(`failed-request-${data.requestId}`, () => {
      this._streamSharingClosed(data.userId, data.requestId);
    });
  }

  /**
   * Closes connection for userId
   * @param {string} userId Close connection for userId
   * @param {?string} requestId Request id
   * @returns {void}
   */
  _streamSharingClosed(userId, requestId) {
    let pc = this.__pcs[userId];

    if (!pc) {
      return;
    }

    if (requestId && pc && requestId !== pc.requestId) {
      return;
    }

    cnsl.log(`Close connection for ${userId} (${requestId})!`);

    cnsl.debug(`close connection for ${pc.requestId}, ${userId}`, pc);

    if (pc.mediaStream) {
      mediaCapturer.destroyStream(pc.mediaStream);
      pc.mediaStream = null;
    }

    pc.pc.close();
    pc.pc.removeEventListener('icecandidate', pc.onIceCandidate);
    pc.pc.removeEventListener('iceconnectionstatechange', pc.onIceConnectionStateChange);
    pc.pc.removeEventListener('track', pc.onTrack);

    broadcastEvents.removeAllListeners(`icecandidate-host-${pc.requestId}`);
    broadcastEvents.removeAllListeners(`stream-offer-host-${pc.requestId}`);
    broadcastEvents.removeAllListeners(`failed-request-${pc.requestId}`);

    pc.requestId = null;
    pc.onIceCandidate = null;
    pc.onIceConnectionStateChange = null;
    pc.onTrack = null;

    pc.pc = null;

    pc = null;

    this.__pcs[userId] = null;

    delete this.__pcs[userId];

    // console.log('-------------__pcs', this.__pcs);

    this.emit('connection-closed', userId);

    // console.log('++++++++', this, broadcastEvents);
  }

  /**
   * On clear all peer connections
   * @returns {void}
   */
  _onClearAll() {
    Object.keys(this.__pcs).forEach(userId => this._streamSharingClosed(userId));
  }

  /**
   * Modify sdp bitrate
   * @param {string} sdp – sdp
   * @param {string} media – media type
   * @param {number} bitrate – bitrate
   * @returns {string|*}
   * @private
   */
  _setMediaBitrate(sdp, media, bitrate) {
    var lines = sdp.split('\n');
    var line = -1;

    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('m=' + media) === 0) {
        line = i;
        break;
      }
    }
    if (line === -1) {
      cnsl.log('Could not find the m line for', media);

      return sdp;
    }
    cnsl.log('Found the m line for', media, 'at line', line);

    // Pass the m line
    line++;

    // Skip i and c lines
    while (lines[line].indexOf('i=') === 0 || lines[line].indexOf('c=') === 0) {
      line++;
    }

    // If we're on a b line, replace it
    if (lines[line].indexOf('b') === 0) {
      cnsl.log('Replaced b line at line', line);
      lines[line] = 'b=AS:' + bitrate;

      return lines.join('\n');
    }

    // Add a new b line
    cnsl.log('Adding new b line before line', line);
    var newLines = lines.slice(0, line);

    newLines.push('b=AS:' + bitrate);
    newLines = newLines.concat(lines.slice(line, lines.length));

    return newLines.join('\n');
  }
}
