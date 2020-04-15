import { sortAny } from '@libs/arrays';

export default {
  /**
   * Get sorted channels
   *
   * @param {ChannelState} state – channels module state
   * @returns {array}
   */
  getChannels: state => {
    return Object.values(state.collection).sort(sortAny([
      {
        key: 'name',
        type: 'string',
        order: 'asc',
      },
    ]));
  },

  /**
   * Get channel by id
   *
   * @param {ChannelState} state – channels module state
   * @returns {object}
   */
  getChannelById: state => id => {
    return state.collection[id];
  },

};
