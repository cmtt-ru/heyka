/**
 * Methods to throttle and their respective throttle delta times
 */

const THROTTLE_METHODS = {
  select: 300,
  unselect: 300,
};

/**
 * Class for storing throttle times for some API methods
 */
class TrottleAPI {
  /**
    * TrottleAPI constructor
    */
  constructor() {
    this.timings = {};
    for (const method in THROTTLE_METHODS) {
      this.timings[method] = {
        lastTime: 0,
        deltaTime: THROTTLE_METHODS[method],
      };
    }
  }

  /**
   * Check if we need to throttle method
   *
   * @param {string} method – method name
   * @returns {boolean}
   */
  needForThrottle(method) {
    const res = !!this.timings[method];

    return res;
  }

  /**
   * Throttle method
   *
   * @param {string} method – method name
   * @returns {boolean}
   */
  throttle(method) {
    const now = Date.now();

    if (now - this.timings[method].deltaTime > this.timings[method].lastTime) {
      this.timings[method].lastTime = now;

      return true;
    } else {
      return false;
    }
  }
}

export default new TrottleAPI();
