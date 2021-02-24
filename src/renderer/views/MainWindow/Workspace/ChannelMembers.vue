<template>
  <pseudo-popup
    :header-has-shadow="false"
    @close="closeHandler"
  >
    <template #header>
      {{ texts.header }}
    </template>

    <template #body>
      <div
        v-sticky.top="{ offset: 44, rootSelector: '.layout__column--content' }"
        class="user-search__wrapper"
      >
        <ui-input
          v-model="filterKey"
          icon="search"
          :placeholder="$t('techTexts.search')"
          class="user-search"
        />
      </div>

      <list
        ref="userList"
        class="user-list"
        :filter-by="filterKey"
      >
        <list-item
          v-for="user in workspaceUsers"
          :key="user.id"
          :filter-key="user.name"
          class="user"
        >
          <avatar
            class="user__avatar"
            :status="user.onlineStatus === 'online' ? '' : user.onlineStatus"
            :image="userAvatar(user.id, 32)"
            :user-id="user.id"
            :size="32"
          />
          <div
            v-textfade
            class="user__inner"
          >
            <div class="user__real-name">
              {{ user.name }}
            </div>

            <div
              class="user__label"
            >
              Admin
            </div>
          </div>
          <ui-button
            class="user__leave"
            :type="7"
            size="small"
            icon="close"
            @click="userLeaveChannel(user.id)"
          />
        </list-item>
      </list>
    </template>
  </pseudo-popup>
</template>

<script>
import UiButton from '@components/UiButton';
import { List, ListItem } from '@components/List';
import { UiInput } from '@components/Form';
import Avatar from '@components/Avatar';
import PseudoPopup from '@components/PseudoPopup';
import { mapGetters } from 'vuex';

export default {
  components: {
    UiButton,
    List,
    ListItem,
    UiInput,
    Avatar,
    PseudoPopup,
  },

  data() {
    return {
      filterKey: '',
    };
  },

  computed: {
    ...mapGetters({
      selectedWorkspaceId: 'me/getSelectedWorkspaceId',
      getAllUsers: 'users/getAllUsers',
      myId: 'me/getMyId',
      userAvatar: 'users/getUserAvatarUrl',
      getUsersInAllChannels: 'channels/getUsersInAllChannels',
      getChannelById: 'channels/getChannelById',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.channelMembers');
    },

    /**
     * Channel id
     * @returns {string}
     */
    channelId() {
      return this.$route.params?.id;
    },

    /**
     * Workspace users (without guests)
     * @returns {object}
     */
    workspaceUsers() {
      return this.getAllUsers.filter(user => user.role !== 'guest' && user.id !== this.myId);
    },
  },

  methods: {
    /**
     * Remove user from members list
     * @param {string} userId – user id
     * @returns {void}
     */
    userLeaveChannel(userId) {
      console.log('leave', userId);
    },

    /**
     * Close handler
     * @returns {void}
     */
    closeHandler() {
      this.$router.back();
    },
  },

};
</script>

<style lang="stylus" scoped>

.user-search__wrapper
  background-color var(--new-bg-04)
  padding 6px 0 12px
  z-index 1
  position relative

  &.ui-sticked:after
    content ''
    position absolute
    bottom 0
    width calc(100% + 32px)
    height 1px
    left -16px
    background-color var(--new-UI-06)

/deep/ .user-search .input
  padding-left 54px

/deep/ .input__icon
  padding-left 10px

.user
  padding 4px 0 4px 10px
  line-height 16px
  display flex
  flex-direction row
  align-items center
  margin-bottom 2px

  &__avatar
    margin-right 12px
    flex-shrink 0

  &__inner
    display flex
    flex-direction column
    align-items flex-start
    flex-grow 1

  &__leave
    color var(--new-signal-03)

  &__label
    font-size 12px
    color var(--new-UI-04)

</style>
