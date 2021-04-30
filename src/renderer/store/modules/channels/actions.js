import API from '@api';
import i18n from '@sdk/translations/i18n';
import router from '@/router';
import { WEB_URL } from '@sdk/Constants';
import notify from '@libs/notify';

export default {
  /**
   * Add existing channel by id
   *
   * @param {object} vuex functions
   * @param {string} channelId – channel id
   * @returns {Promise<void>}
   */
  async addChannel({ commit, getters, dispatch, rootGetters }, channelId) {
    const isChannelExist = getters['getChannelById'](channelId);

    if (isChannelExist) {
      return;
    }

    const channelInfo = await API.channel.info(channelId);

    if (channelInfo) {
      commit('ADD_CHANNEL', channelInfo);
    }
  },

  /**
   * Edit existing channel
   *
   * @param {object} vuex functions
   * @param {object} id – channel id
   * @param {object} channel – channel data
   * @param {string} channel.name – channel name
   * @param {boolean} channel.isPrivate – private state
   * @returns {Promise<void>}
   */
  async editChannel({ commit, getters, dispatch, rootGetters }, { id, channel }) {
    await API.channel.edit(id, channel);
  },

  /**
   * Create new channel
   *
   * @param {object} vuex functions
   * @param {object} channel – channel data
   * @param {string} channel.name – channel name
   * @param {boolean} channel.isPrivate – private state
   * @returns {Promise<void>}
   */
  async createChannel({ commit, getters, dispatch, rootGetters }, channel) {
    const workspaceId = rootGetters['me/getSelectedWorkspaceId'];
    const response = await API.channel.create(workspaceId, channel);

    if (response.channel.id) {
      return response.channel;
    }

    return false;
  },

  /**
   * Delete channel by id
   *
   * @param {object} vuex functions
   * @param {string} channelId – channel id
   * @returns {Promise<void>}
   */
  async deleteChannel({ commit, getters, dispatch, rootGetters }, channelId) {
    const channel = getters['getChannelById'](channelId);

    if (!channel) {
      return;
    }

    const texts = i18n.t('notifications.deleteChannel');

    notify(`${texts.text} "${channel.name}"?`, {
      modal: true,
      buttons: [
        {
          text: texts.yes,
          type: 12,
          action: async () => {
            /** Delete channel */
            await API.channel.remove(channelId);
            router.push({ name: 'workspace' });
          },
        },
        {
          text: texts.no,
          close: true,
        },
      ],
    });
  },

  /**
   * Copy invite link to channel
   *
   * @param {object} vuex functions
   * @param {string} channelId – channel id
   * @returns {Promise<void>}
   */
  async copyInviteLink({ dispatch }, channelId) {
    const invite = await API.channel.invite(channelId);

    let url = '';

    if (invite.token) {
      url = `${WEB_URL}/guest/${invite.token}`;
      navigator.clipboard.writeText(url);

      notify('workspace.channel.inviteCopied');

      return {
        url,
        ...invite,
      };
    }
  },

  /**
   * Revoke invite links to channel
   *
   * @param {object} vuex functions
   * @param {string} channelId – channel id
   * @returns {Promise<void>}
   */
  async revokeInviteLinks({ dispatch }, channelId) {
    await API.channel.deleteAllInvites(channelId, true);

    notify('workspace.channel.invitesDeleted');
  },

  /**
   * Add conversation data
   *
   * @param {object} vuex functions
   * @param {string} userId – user id
   * @param {string} action – action
   * @param {string} data – data
   * @returns {void}
   */
  async processConversationData({ dispatch, commit, rootGetters }, { userId, action, data }) {
    const channelId = rootGetters['me/getSelectedChannelId'];

    if (!channelId) {
      console.error('Process Conversation Data --> no selected channel');

      return;
    }

    if (!userId) {
      console.error('Process Conversation Data --> `userId` is not defined');

      return;
    }

    if (!action) {
      console.error('Process Conversation Data --> `action` is not defined');

      return;
    }

    if (data === undefined) {
      console.error('Process Conversation Data --> `data` is not defined');

      return;
    }

    const commitData = {
      channelId,
      userId,
      action,
      data,
    };

    switch (action) {
      case 'audio-quality-indicator':
        commit('ADD_CONVERSATION_DATA', commitData);
        break;

      case 'hand-up':
        if (commitData.data.state) {
          commitData.data.timestamp = Date.now();
          if (commitData.userId !== rootGetters['me/getMyId']) {
            await dispatch('app/addPush', {
              local: true,
              inviteId: Date.now().toString(),
              message: { action: 'hand' },
              userId: commitData.userId,
            }, { root: true });
          }

          commit('ADD_CONVERSATION_EVENT', commitData);
        }
        commit('ADD_CONVERSATION_DATA', commitData);

        break;

      case 'socket-reconnecting':
        commit('ADD_CONVERSATION_DATA', commitData);
        break;

      case 'mini-chat':
        commitData.data.timestamp = Date.now();
        commit('ADD_CONVERSATION_EVENT', commitData);
        break;
    }
  },
};
