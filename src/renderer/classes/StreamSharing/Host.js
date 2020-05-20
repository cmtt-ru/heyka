import { EventEmitter } from 'events';
import broadcastEvents from '../broadcastEvents';
/* eslint-disable */

/**
 * StreamSharingHost
 * Manages sharing media streams on host side
 * @class
 */
export default class StreamSharingHost extends EventEmitter {
  /**
   * Init stream sharing manager
   */
  constructor() {
    super();

    broadcastEvents.on('request-stream', this._onRequestStream.bind(this));

    this.__debugEnabled = true;
  }

  async sendStream(streamMetadata, stream) {
    let pc = new RTCPeerConnection();

    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.addEventListener('iceconnectionstatechange', () => {
      if (pc && (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected')) {
        pc.close();
        pc = null;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          stream = null;
        }
      }
    });
    pc.addEventListener('icecandidate', async e => {
      broadcastEvents.dispatch(`icecandidate-host-${streamMetadata.requestId}`, {
        type: 'icecandidate',
        candidate: e.candidate,
      });
    });
    broadcastEvents.on(`icecandidate-receiver-${streamMetadata.requestId}`, async data => {
      this._debug(`Add candidate for request ${streamMetadata.requestId}`);
      await pc.addIceCandidate(data.candidate);
    });
    const sdpOffer = await pc.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: false,
    });

    await pc.setLocalDescription(sdpOffer);

    broadcastEvents.dispatch(`stream-offer-host-${streamMetadata.requestId}`, {
      sdpOffer: {
        type: 'offer',
        sdp: sdpOffer.sdp
      },
      userId: streamMetadata.userId
    })
    broadcastEvents.once(`sdp-answer-reseiver-${streamMetadata.requestId}`, async (data) => {
      this._debug(`remote sdp answer: `, data.sdpAnswer)
      await pc.setRemoteDescription(data.sdpAnswer);
    });
  }

  _onRequestStream(data) {
    this.emit('request-stream', data);
  }

  _debug() {
    if (this.__debugEnabled) {
      console.log(`Stream sharing manager host: `, ...arguments);
    }
  }
}
