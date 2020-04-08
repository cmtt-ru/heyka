import { sortAny } from '@libs/arrays';

export default {

  /**
   * Get sorted channels
   *
   * @param {object} state – channels module state
   * @return {array}
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
   * @param {object} state – channels module state
   * @return {object}
   */
  getChannelById: state => id => {
    return state.collection[id];
  },

};
