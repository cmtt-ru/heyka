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
        v-sticky.top="{ offset: 0, rootSelector: '.pseudo-popup__body' }"
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
          v-for="user in members"
          :key="user.id"
          :filter-key="user.name"
          class="user"
        >
          <avatar
            class="user__avatar"
            :user-id="user.id"
            :status="user.onlineStatus !== 'online'"
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
              v-if="user.channelRelation.role === 'admin'"
              class="user__label"
            >
              {{ texts.admin }}
            </div>
          </div>
          <ui-button
            v-if="user.channelRelation.role !== 'admin'"
            class="user__leave"
            :type="7"
            size="small"
            icon="close"
            @click="deleteMember(user.id)"
          />
        </list-item>
      </list>
    </template>
  </pseudo-popup>
</template>

<script>
import API from '@api';
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
      members: [],
    };
  },

  computed: {
    ...mapGetters({
      userAvatar: 'users/getUserAvatarUrl',
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
  },

  async mounted() {
    this.updateMembersList();
  },

  methods: {
    /**
     * Remove user from members list
     * @param {string} userId – user id
     * @returns {void}
     */
    async deleteMember(userId) {
      await API.channel.deleteMembers(this.channelId, [ userId ]);
      await this.updateMembersList();
    },

    /**
     * Update members list
     * @returns {void}
     */
    async updateMembersList() {
      this.members = await API.channel.getMembers(this.channelId);
    },

    /**
     * Close handler
     * @returns {void}
     */
    closeHandler() {
      this.__backOrRedirect();
    },
  },

};
</script>

<style lang="stylus" scoped>

.user-search__wrapper
  background var(--Background-white)
  padding 5px 0 9px
  z-index 1
  position sticky
  top 0

  &.ui-sticked:after
    content ''
    position absolute
    bottom 0
    width calc(100% + 32px)
    height 1px
    left -16px
    background var(--UI-divider-1)

/deep/ .user-search .input
  padding-left 54px

/deep/ .input__icon
  padding-left 10px

.user
  padding 6px 0 6px 10px
  line-height 16px
  display flex
  flex-direction row
  align-items center
  height 44px

  &__avatar
    margin-right 12px
    flex-shrink 0

  &__inner
    display flex
    flex-direction column
    align-items flex-start
    flex-grow 1

  &__leave
    color var(--UI-error)

  &__label
    font-size 12px
    padding-top 4px
    color var(--Text-secondary)

</style>
