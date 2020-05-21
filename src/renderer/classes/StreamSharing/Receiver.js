import { EventEmitter } from 'events';
import broadcastEvents from '../broadcastEvents';
import uuid from 'uuid/v4';

/**
 * StreamSharingReceiver`
 * Manages sharing media streams on receiver side
 * @class
 */
export default class StreamSharingReceiver extends EventEmitter {
  /**
   * Init stream sharing manager
   * @param {object} options Stream sharing receiver manager options
   * @param {boolean} [options.debug=false] Is debug enabled
   */
  constructor(options) {
    super();

    this.__debugEnabled = !!options.debug;
    broadcastEvents.on('stream-sharing-closed', userId => {
      this.emit('connection-closed', userId);
    });
  }

  /**
   * Requests stream of given user from main window
   * @param {string} userId Which user you want to request stream
   * @returns {void}
   */
  requestStream(userId) {
    const data = {
      requestId: uuid(),
      userId,
    };
    const pc = new RTCPeerConnection();

    // subscribe for ICE candidate
    pc.addEventListener('icecandidate', async e => {
      if (!e.candidate) {
        return;
      };
      this._debug('ice-candidate', e.candidate.toJSON());

      // send ICE candidate to another window
      broadcastEvents.dispatch(`icecandidate-receiver-${data.requestId}`, {
        type: 'candidate',
        candidate: e.candidate.toJSON(),
      });
    });

    // Handle ICE connection state change
    pc.addEventListener('iceconnectionstatechange', e => {
      this._debug('ice-state', pc.iceConnectionState);
      if (pc && (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected')) {
        pc.close();
        this.emit('connection-closed', userId);
      }
    });

    // Handle new track of the connection
    pc.addEventListener('track', async track => {
      this._debug('Cought track from RTCPeerConnection: ', track);
      // notify about new received stream
      this.emit('new-stream', {
        userId,
        stream: track.streams[0],
      });
    });

    // handle offer from main window
    broadcastEvents.once(`stream-offer-host-${data.requestId}`, async (d) => {
      this._debug('offer', d);
      await pc.setRemoteDescription(d.sdpOffer);
      const answer = await pc.createAnswer();

      await pc.setLocalDescription(answer);
      // send answer
      broadcastEvents.dispatch(`sdp-answer-receiver-${data.requestId}`, {
        sdpAnswer: {
          sdp: answer.sdp,
          type: 'answer',
        },
      });
    });

    // handle ICE candidates from stream host
    broadcastEvents.on(`icecandidate-host-${data.requestId}`, async (evt) => {
      this._debug('add ice candidate', evt);
      await pc.addIceCandidate(evt.candidate);
    });

    // Request stream
    broadcastEvents.dispatch('request-stream', data);
  }

  /**
   * Inner debug tool
   * @returns {void}
   */
  _debug() {
    if (this.__debugEnabled) {
      console.log('Stream sharing receiver: ', ...arguments);
    }
  }
}
