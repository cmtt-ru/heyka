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
        key: 'isTemporary',
        type: 'boolean',
        order: 'desc',
      },
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

  /**
   * Get audio quality status by user id
   *
   * @param {ChannelState} state – channels module state
   * @param {object} getters – vuex getters
   * @returns {object}
   */
  getAudioQualityStatusByUserId: (state, getters) => userId => {
    const aqiData = getters['getConversationData'](userId, 'audio-quality-indicator')?.status;

    return aqiData || 0;
  },

  /**
   * Get "raise hand" timestamp by user id
   *
   * @param {ChannelState} state – channels module state
   * @param {object} getters – vuex getters
   * @returns {object}
   */
  getHandUpStatusByUserId: (state, getters) => userId => {
    const aqiData = getters['getConversationData'](userId, 'hand-up')?.timestamp;

    return aqiData || 0;
  },

  /**
   * Get conversation data
   *
   * @param {ChannelState} state – channels module state
   * @param {object} getters – vuex getters
   * @param {object} rootState – vuex root state
   * @param {object} rootGetters – vuex root getters
   * @returns {object}
   */
  getConversationData: (state, getters, rootState, rootGetters) => (userId, action) => {
    const channelId = rootGetters['me/getSelectedChannelId'];

    if (!channelId || !userId) {
      return null;
    }

    const channel = getters['getChannelById'](channelId);

    if (!channel.conversationData || !channel.conversationData[userId] || !channel.conversationData[userId][action]) {
      return null;
    }

    return channel.conversationData[userId][action];
  },

  /**
   * Get conversation events
   *
   * @param {ChannelState} state – channels module state
   * @param {object} getters – vuex getters
   * @param {object} rootState – vuex root state
   * @param {object} rootGetters – vuex root getters
   * @returns {object}
   */
  getConversationEvents: (state, getters, rootState, rootGetters) => {
    const channelId = rootGetters['me/getSelectedChannelId'];

    if (!channelId) {
      return null;
    }

    const channel = getters['getChannelById'](channelId);

    if (channel) {
      return channel.conversationEvents;
    }
  },

};
