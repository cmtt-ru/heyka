import { EventEmitter } from 'events';

/**
 * Bus for janus connection events
 * @class
 */
class JanusEvents extends EventEmitter {
  /* eslint-disable require-jsdoc */
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super();
  }
}

export default new JanusEvents();