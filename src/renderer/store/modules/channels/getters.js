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

  getUsersInAllChannels: state => {
    const users = {};

    for (const channelId in state.collection) {
      if (state.collection[channelId].users.length > 0) {
        for (const user of state.collection[channelId].users) {
          users[user.userId] = channelId;
        }
      }
    }

    return users;
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
    const huiData = getters['getConversationData'](userId, 'hand-up')?.timestamp;

    return huiData || 0;
  },

  /**
   * Get audio quality status by user id
   *
   * @param {ChannelState} state – channels module state
   * @param {object} getters – vuex getters
   * @returns {object}
   */
  getReconnectingStatusByUserId: (state, getters) => userId => {
    const rData = getters['getConversationData'](userId, 'socket-reconnecting');

    return !!rData;
  },

  /**
   * Get mini chat messages
   *
   * @param {ChannelState} state – channels module state
   * @param {object} getters – vuex getters
   * @returns {object}
   */
  getMiniChatMessages: (state, getters) => {
    const data = getters['getConversationEvents']('mini-chat');

    return data || [];
  },

  /**
   * Get mini chat last messages
   *
   * @param {ChannelState} state – channels module state
   * @param {object} getters – vuex getters
   * @returns {object}
   */
  getMiniChatLastMessageTimestamp: (state, getters) => {
    const lastMessage = getters['getConversationEvents']('mini-chat')?.slice(-1)[0];

    if (lastMessage) {
      return lastMessage.data.timestamp;
    }

    return 0;
  },

  /**
   * Is there new  mini chat messages
   *
   * @param {ChannelState} state – channels module state
   * @param {object} getters – vuex getters
   * @param {RootState} rootState – vuex getters
   * @returns {boolean}
   */
  hasMiniChatNewMessages: (state, getters, rootState) => {
    const lastMessageTimestamp = getters['getMiniChatLastMessageTimestamp'];

    return lastMessageTimestamp > rootState.app.miniChatLastReadTimestamp;
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
   * @returns {array}
   */
  getConversationEvents: (state, getters, rootState, rootGetters) => (action) => {
    const channelId = rootGetters['me/getSelectedChannelId'];

    if (!channelId) {
      return null;
    }

    const channel = getters['getChannelById'](channelId);

    if (channel && channel.conversationEvents) {
      if (action) {
        return channel.conversationEvents.filter(c => c.action === action);
      }

      return channel.conversationEvents;
    }

    return [];
  },

};
