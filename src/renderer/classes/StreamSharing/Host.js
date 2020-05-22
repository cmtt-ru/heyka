import { EventEmitter } from 'events';
import broadcastEvents from '../broadcastEvents';

/**
 * StreamSharingHost
 * Manages sharing media streams on host side
 * @class
 */
export default class StreamSharingHost extends EventEmitter {
  /**
   * Init stream sharing manager
   * @param {object} options Stream host manager options
   * @param {boolean} [options.debug=false] Is debug enable
   */
  constructor(options) {
    super();

    broadcastEvents.on('request-stream', this._onRequestStream.bind(this));

    this.__debugEnabled = !!options.debug;
    this.pcs = {};
  }

  /**
   * Send stream by RTCPeerConnection
   * @param {object} requestData Request stream data
   * @param {string} requestData.requestId Unique request identifier
   * @param {string} requestData.userId Id of stream owner
   * @param {MediaStream} stream Media stream
   * @returns {void}
   */
  async sendStream(requestData, stream) {
    let pc = new RTCPeerConnection();

    this.pcs[requestData.userId] = pc;

    // add stream to RTCPeerConnection
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // subscribe for changing iceConnectionState
    pc.addEventListener('iceconnectionstatechange', () => {
      this._debug('iceconnectionstate', pc.iceConnectionState);
      if (pc && (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected')) {
        pc.close();
        pc = null;
        delete this.pcs[requestData.userId];
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          stream = null;
        }
      }
    });

    // handle ICE candidates
    pc.addEventListener('icecandidate', async e => {
      if (!e.candidate) {
        return;
      }
      // send ICE candidates to another window
      broadcastEvents.dispatch(`icecandidate-host-${requestData.requestId}`, {
        type: 'icecandidate',
        candidate: e.candidate,
      });
    });

    // subscribe on ICE candidates from another window
    broadcastEvents.on(`icecandidate-receiver-${requestData.requestId}`, async data => {
      this._debug(`Add candidate for request ${requestData.requestId}`, data);
      await pc.addIceCandidate(data.candidate);
    });

    // subscribe for sdp answer from another window
    broadcastEvents.once(`sdp-answer-receiver-${requestData.requestId}`, async (data) => {
      this._debug(`remote sdp answer: `, data.sdpAnswer);
      await pc.setRemoteDescription(data.sdpAnswer);
    });

    // Create SDP offer
    const sdpOffer = await pc.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: false,
    });

    await pc.setLocalDescription(sdpOffer);

    // Send SDP offer to another window
    broadcastEvents.dispatch(`stream-offer-host-${requestData.requestId}`, {
      sdpOffer: {
        type: 'offer',
        sdp: sdpOffer.sdp,
      },
      userId: requestData.userId,
    });
  }

  /**
   * Close stream sharing for user
   * @param {string} userId User id
   * @returns {void}
   */
  async closeStreamSharing(userId) {
    if (!this.pcs[userId]) {
      return;
    }
    this._debug(`Close peer connection for ${userId}`);
    this.pcs[userId].close();
    delete this.pcs[userId];
    broadcastEvents.dispatch(`stream-sharing-closed`, userId);
  }

  /**
   * Clean up all connections
   * @returns {void}
   */
  clearAll() {
    Object.keys(this.pcs).forEach(key => {
      this.pcs[key].close();
      delete this.pcs[key];
    });
    broadcastEvents.dispatch(`clear-all`);
  }

  /**
   * Notify another window about failed request
   * @param {string} requestId Unique request id
   * @returns {void}
   */
  failedRequest(requestId) {
    broadcastEvents.dispatch(`failed-request-${requestId}`);
  }

  /**
   * Notify about requested stream
   * @param {object} data Request data
   * @returns {void}
   */
  _onRequestStream(data) {
    this.emit('request-stream', data);
  }

  /**
   * Inner debug tool
   * @returns {void}
   */
  _debug() {
    if (this.__debugEnabled) {
      console.log(`Stream sharing manager host: `, ...arguments);
    }
  }
}
