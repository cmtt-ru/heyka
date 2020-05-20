import { EventEmitter } from 'events';
import broadcastEvents from '../broadcastEvents';
import uuid from 'uuid/v4';
/* eslint-disable */

/**
 * StreamSharingReceiver`
 * Manages sharing media streams on receiver side
 * @class
 */
export default class StreamSharingHost extends EventEmitter {
  /**
   * Init stream sharing manager
   */
  constructor() {
    super();

    this.__debugEnabled = true;
  }

  requestStream(userId) {
    const data = {
      requestId: uuid(),
      userId,
    };
    const pc = new RTCPeerConnection();
    pc.addEventListener('icecandidate', async e => {
      if (!e.candidate) return
      this._debug('ice-candidate', e.candidate.toJSON())
      broadcastEvents.dispatch(`icecandidate-receiver-${data.requestId}`, {
        type: 'candidate',
        candidate: e.candidate
      })
    })
    pc.addEventListener('iceconnectionstatechange', e => {
      this._debug('ice-state', pc.iceConnectionState);
    })
    pc.addEventListener('track', async track => {
      this.emit('new-stream', {
        userId,
        stream: track.streams[0]
      })
    })
    broadcastEvents.once(`stream-offer-host-${data.requestId}`, async (data) => {
      this._debug('offer', data)
      await pc.setRemoteDescription(data.sdpOffer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      broadcastEvents.dispatch(`sdp-answer-receiver-${data.requestId}`, {
        sdpAnswer: {
          sdp: answer.sdp,
          type: 'answer'
        }
      })
    })
    broadcastEvents.on(`icecandidate-host-${data.requestId}`, async (data) => {
        this._debug('add ice candidate', data)
        await pc.addIceCandidate(data.candidate)
    })
    broadcastEvents.dispatch('request-stream', data);
  }

  _debug() {
    if (this.__debugEnabled) {
      console.log('Stream sharing receiver: ', ...arguments);
    }
  }
}
