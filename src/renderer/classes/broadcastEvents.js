import { EventEmitter } from 'events';

/**
 * Class for broadcasting events
 */
class BroadcastEvents extends EventEmitter {
  /**
   * Broadcast events constructor
   */
  constructor() {
    super();

    this.broadcastChannel = new BroadcastChannel('events');
    this.broadcastChannel.onmessage = this.messageReceived.bind(this);
  }

  /**
   * Dispatch action
   *
   * @param {string} event – rendere-to-tenderer event name
   * @param {*} data – event data
   * @returns {void}
   */
  dispatch(event, data) {
    const message = JSON.stringify({
      event,
      data,
    });

    this.broadcastChannel.postMessage(message);
    this.emit(event, data);
  }

  /**
   * Receive message from broadcast channel
   *
   * @param {string} data – stringified event with data
   * @returns {void}
   */
  messageReceived({ data }) {
    const message = JSON.parse(data);

    this.emit(message.event, message.data);
  }
}

export default new BroadcastEvents();
