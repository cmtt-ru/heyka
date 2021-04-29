<template>
  <div
    v-if="user"
    class="l-p-16"
  >
    <div class="user">
      <avatar
        :key="user.avatar"
        class="user__avatar"
        :user-id="user.id"
        :size="40"
        :status="true"
      />
      <div
        v-textfade
        class="user__name"
      >
        {{ user.name }}
      </div>
    </div>

    <div v-if="user.onlineStatus==='offline'">
      <ui-button
        :type="17"
        wide
        size="large"
        icon="slack"
        class="user-action"
        @click="_notImplemented()"
      >
        <div>{{ texts.inviteBySlackButton }}</div>
      </ui-button>
      <ui-button
        :type="17"
        wide
        size="large"
        icon="ms-teams"
        class="user-action"
        @click="_notImplemented()"
      >
        <div>{{ texts.inviteByTeamsButton }}</div>
      </ui-button>
    </div>

    <div v-else>
      <ui-button
        v-if="!isMe && !isInPrivateTalk"
        :type="1"
        wide
        size="large"
        class="user-action"
        @click="startPrivateTalk(user.id)"
      >
        <div>{{ texts.privateTalkButton }}</div>
      </ui-button>
      <ui-button
        v-if="selectedChannel && !isMe"
        :type="17"
        wide
        size="large"
        class="user-action"
        :disabled="inviteButtonDisabled[user.id]"
        @click="sendInvite"
      >
        <div
          v-textfade
          class="user-action__inner"
        >
          <div>{{ texts.inviteButtonStart }}</div>
          <svg-icon
            class="icon-in-button"
            name="channelOnAir"
            size="medium"
          />
          <div>{{ selectedChannel.name }}</div>
        </div>
      </ui-button>
    </div>
    <!--
    <div class="user-info">
      <div class="user-info__title">
        {{ texts.localTime }}
      </div>
      <div class="user-info__content">
        {{ time }}
      </div>
    </div> -->

    <div class="user-info">
      <router-link :to="{ name: 'edit-profile-main'}">
        <ui-button
          v-if="isMe"
          :type="1"
          wide
          size="large"
          class="user-action"
        >
          <div>{{ texts.edit }}</div>
        </ui-button>
      </router-link>
    </div>

    <div class="user-info">
      <div class="user-info__title">
        {{ texts.email }}
      </div>
      <div class="user-info__content user-info__content--email">
        {{ user.email }}
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';

const DISABLE_AFTER_INVITE_TIMEOUT = 5000;

/**
 * status-to-color map (small circle to the right of username)
 */
const STATUS_COLORS = {
  online: {
    'background-color': 'var(--color-1)',
    'border-color': 'var(--color-1)',
  },
  idle: {
    'background-color': 'var(--color-3)',
    'border-color': 'var(--color-3)',
  },
  offline: {
    'background-color': 'transparent',
    'border-color': 'var(--color-4)',
  },
};

export default {
  components: {
    Avatar,
    UiButton,
  },

  data() {
    return {
      inviteButtonDisabled: {},
    };
  },

  computed: {
    ...mapGetters({
      selectedChannel: 'myChannel',
      myUserID: 'me/getMyId',
      userAvatar: 'users/getUserAvatarUrl',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.user');
    },
    /**
     * Display user's time
     * @returns {string} hh:mm
     */
    time() {
      const now = new Date(); // TODO: 1) update every minute; 2) get user's timezone
      const twoDigits = 2;

      return now.getHours().toString()
        .padStart(twoDigits, '0') + ':' + now.getMinutes().toString()
        .padStart(twoDigits, '0');
    },

    /**
     * Get user ID from route param
     * @returns {string} – user ID
     */
    userId() {
      return this.$route.params.id;
    },

    /**
     * Returns current user
     * @returns {object} – user
     */
    user() {
      return this.$store.getters['users/getUserById'](this.userId);
    },

    /**
     * Set status-circle color
     * @returns {object} background-color and border-color
     */
    statusStyle() {
      return STATUS_COLORS[this.user.onlineStatus] || null;
    },

    /**
     * Is me
     * @returns {boolean}
     */
    isMe() {
      return this.myUserID === this.userId;
    },

    /**
     * Check if we are currently in a private talk
     * @returns {boolean}
     */
    isInPrivateTalk() {
      if (this.selectedChannel?.isTemporary === true) {
        return true;
      }

      return false;
    },
  },

  methods: {

    async sendInvite() {
      await this.$store.dispatch('app/sendPush', {
        userId: this.userId,
        isResponseNeeded: true,
        message: {
          action: 'invite',
          channelId: this.$store.getters['me/getSelectedChannelId'],
        },
      });

      const notification = {
        lifespan: 3000,
        data: {
          text: this.texts.inviteSent,
        },
      };

      this.$store.dispatch('app/addNotification', notification);

      this.$set(this.inviteButtonDisabled, this.user.id, true);

      setTimeout(() => {
        this.$delete(this.inviteButtonDisabled, this.user.id);
      }, DISABLE_AFTER_INVITE_TIMEOUT);
    },

    async startPrivateTalk(userId) {
      this.$store.dispatch('createPrivateChannel', userId);
    },
  },

};
</script>

<style lang="stylus" scoped>

.user
  height 40px
  padding 0
  margin 2px 0 16px
  width 100%
  box-sizing border-box
  display flex
  flex-direction row
  align-items center
  justify-content flex-start

  &__avatar
    flex-shrink 0
    flex-grow 0

  &__name
    margin-left 12px
    font-weight 500
    font-size 16px
    line-height 22px
    letter-spacing -0.24px
    flex-shrink 1

  &__status
    right 0
    width 8px
    height 8px
    box-sizing border-box
    border-radius 50%
    border: 2px solid
    margin 2px 8px 0
    flex-shrink 0
    flex-grow 0

  &__more
    margin-left auto
    flex-shrink 0
    flex-grow 0
    margin-top -18px
    color var(--icon-1)

.user-action
  margin-bottom 12px

  &__inner
    display flex
    flex-direction row
    align-items center

    & div, svg
      flex-shrink 0

.icon-in-button
  margin 0 4px

.user-info
  margin-top 12px

  &__title
    font-weight bold
    line-height 24px
    color var(--new-UI-02)

  &__content
    margin-top 4px
    line-height 22px

    &--email
      user-select all

</style>
