import { EventEmitter } from 'events';
import broadcastEvents from '../broadcastEvents';
import Logger from '@classes/logger';
const cnsl = new Logger('Host.js', '#85929E');

/**
 * StreamSharingHost
 * Manages sharing media streams on host side
 * @class
 */
export default class StreamSharingHost extends EventEmitter {
  /**
   * Init stream sharing manager
   * @param {object} options Stream host manager options
   */
  constructor(options) {
    super();

    broadcastEvents.on('request-stream', this._onRequestStream.bind(this));

    this.__pcs = {};
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
    const pc = new RTCPeerConnection();

    this.__pcs[requestData.userId] = pc;

    // add stream to RTCPeerConnection
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // subscribe for changing iceConnectionState
    pc.addEventListener('iceconnectionstatechange', () => {
      const pcnow = this.__pcs[requestData.userId];

      if (!pcnow) {
        return;
      }

      cnsl.debug('iceconnectionstate', pcnow.iceConnectionState);
      if (pcnow && (pcnow.iceConnectionState === 'failed' || pcnow.iceConnectionState === 'disconnected')) {
        cnsl.debug('connection-closed for ', requestData);
        pcnow.close();
        delete this.__pcs[requestData.userId];
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
      cnsl.debug(`Add candidate for request ${requestData.requestId}`, data);
      await pc.addIceCandidate(data.candidate);
    });

    // subscribe for sdp answer from another window
    broadcastEvents.once(`sdp-answer-receiver-${requestData.requestId}`, async (data) => {
      cnsl.debug(`remote sdp answer: `, data.sdpAnswer);
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
    if (this.__pcs[userId]) {
      this.__pcs[userId].close();
      delete this.__pcs[userId];
    }
    cnsl.debug(`Close peer connection for ${userId}`);
    broadcastEvents.dispatch(`stream-sharing-closed`, userId);
  }

  /**
   * Clean up all connections
   * @returns {void}
   */
  clearAll() {
    Object.keys(this.__pcs).forEach(key => {
      this.__pcs[key].close();
      delete this.__pcs[key];
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
    cnsl.log('Stream is requested', data);
    this.emit('request-stream', data);
  }
}
