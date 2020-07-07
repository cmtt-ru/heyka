import { EventEmitter } from 'events';
import broadcastEvents from '../broadcastEvents';
import mediaCapturer from '../mediaCapturer';
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

    const onIceConnectionStateChange = e => {
      cnsl.debug('iceconnectionstate', pc.iceConnectionState);

      if (pc && (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected')) {
        this.closeStreamSharing(requestData.userId, requestData.requestId);
      }
    };

    const onIceCandidate = e => {
      if (!e.candidate) {
        return;
      }
      // send ICE candidates to another window
      broadcastEvents.dispatch(`icecandidate-host-${requestData.requestId}`, {
        type: 'icecandidate',
        candidate: e.candidate,
      });
    };

    this._addPcs({
      userId: requestData.userId,
      requestId: requestData.requestId,
      mediaStream: stream,
      onIceConnectionStateChange,
      onIceCandidate,
      pc,
    });

    // add stream to RTCPeerConnection
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    // subscribe for changing iceConnectionState
    pc.addEventListener('iceconnectionstatechange', onIceConnectionStateChange);

    // handle ICE candidates
    pc.addEventListener('icecandidate', onIceCandidate);

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
   * @param {string} [requestId] – request id
   * @returns {void}
   */
  async closeStreamSharing(userId, requestId) {
    const pcs = this.__pcs[userId];

    broadcastEvents.dispatch(`stream-sharing-closed`, userId);

    if (!pcs || pcs.length === 0) {
      return;
    }

    if (!requestId) {
      pcs.forEach(pc => this.destroyPc(pc));

      delete this.__pcs[userId];
    } else {
      const pcIndex = pcs.findIndex(pc => pc.requestId === requestId);

      if (pcIndex > -1) {
        this.destroyPc(pcs[pcIndex]);
        pcs.splice(pcIndex, 1);
      }
    }

    cnsl.debug(`Close peer connection for ${userId}`);
  }

  destroyPc(pc) {
    if (pc.mediaStream) {
      mediaCapturer.destroyStream(pc.mediaStream);
      pc.mediaStream = null;
    }

    pc.pc.close();
    pc.pc.removeEventListener('icecandidate', pc.onIceCandidate);
    pc.pc.removeEventListener('iceconnectionstatechange', pc.onIceConnectionStateChange);

    broadcastEvents.removeAllListeners(`icecandidate-receiver-${pc.requestId}`);
    broadcastEvents.removeAllListeners(`sdp-answer-receiver-${pc.requestId}`);

    pc.userId = null;
    pc.requestId = null;
    pc.onIceCandidate = null;
    pc.onIceConnectionStateChange = null;
    pc.pc = null;

    pc = null;
  }

  /**
   * Clean up all connections
   * @returns {void}
   */
  clearAll() {
    Object.keys(this.__pcs).forEach(key => {
      this.closeStreamSharing(key.userId);
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

  /**
   * Add new peer connection
   * @param {object} data - some data
   * @returns {void}
   */
  _addPcs(data) {
    const userId = data.userId;

    if (!this.__pcs[userId]) {
      this.__pcs[userId] = [];
    }

    this.__pcs[userId].push(data);
  }
}
