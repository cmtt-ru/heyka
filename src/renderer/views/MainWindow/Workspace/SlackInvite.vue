<template>
  <div>
    <div class="">
      {{ texts.noWorkspaces }}
    </div>
    <ui-button
      :type="17"
      :wide="true"
      class="link"
      icon="slack"
      @click="slackConnect"
    >
      {{ texts.connect }}
    </ui-button>
    <div
      v-if="slackUsers.length"
      class="slack-user-list"
    >
      <ui-input
        v-model="filterKey"
        icon="search"
        placeholder="Search"
      />
      <list
        selectable
        :filter-by="filterKey"
        @multipick="selectUser"
      >
        <list-item
          v-for="user in slackUsers"
          :key="user.id"
          :filter-key="user.name"
          :selectable-content="user"
          button
          class="user"
        >
          <avatar
            class="user__avatar"
            :image="user.avatar32"
            :user-id="user.id"
            :size="32"
          />
          <div
            v-textfade
            class="user__inner"
          >
            <div
              class="user__real-name"
            >
              {{ user.realName }}
            </div>
            <div class="user__name">
              @{{ user.name }}
            </div>
          </div>
          <svg-icon
            class="user__check"
            name="check"
            width="16"
            height="16"
          />
        </list-item>
      </list>
      <ui-button
        v-if="selectedUsers.length"
        :type="1"
        @click="sendOneInvite"
      >
        {{ $tc("slackInvite.inviteUsers", selectedUsers.length) }}
      </ui-button>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiInput } from '@components/Form';
import { List, ListItem } from '@components/List';
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';
// import DeepLink from '@shared/DeepLink/DeepLinkRenderer';

export default {
  components: {
    UiButton,
    UiInput,
    List,
    ListItem,
    Avatar,
  },

  data() {
    return {
      slackUsers: [],
      selectedUsers: [],
      filterKey: '',
    };
  },

  computed: {
    ...mapGetters({
      selectedWorkspaceId: 'me/getSelectedWorkspaceId',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('slackInvite');
    },

  },

  async mounted() {
    // DeepLink.on('slack-connect', ([status, error]) => {
    //   if (status === 'false') {
    //     this.$store.dispatch('app/addNotification', {
    //       data: {
    //         text: decodeURIComponent(error),
    //       },
    //     });
    //   }
    // });

    try {
      const users = await this.$API.workspace.getSlackUsers(this.selectedWorkspaceId);

      this.slackUsers = users;
    } catch (err) {
      console.log(err);
    }
  },

  beforeDestroy() {
    // DeepLink.removeAllListeners('slack-connect');
  },

  methods: {

    async slackConnect() {
      const url = await this.$API.workspace.connectWithSlack(this.selectedWorkspaceId);

      window.open(url.redirect);
    },

    selectUser(data) {
      this.selectedUsers = data;
    },

    async sendOneInvite() {
      try {
        for (const user of this.selectedUsers) {
          await this.$API.workspace.inviteSlackUser(this.selectedWorkspaceId, { slackUserId: user.id });
        }
      } catch (err) {
        console.error(err);
      }
    },

  },

};
</script>

<style lang="stylus" scoped>
  .user
    padding 4px 10px
    display flex
    flex-direction row
    align-items center
    margin-bottom 2px
    border-radius 6px
    cursor pointer

    &:hover
      background-color var(--new-UI-06)

    &__check
      margin 0 5px
      flex-shrink 0
      color white
      display none

    &.list-item--selected
      background-color var(--new-UI-01)
      color var(--new-UI-09)

      & .user__check
        display initial

    &__avatar
      margin-right 12px
      flex-shrink 0

    &__inner
      display flex
      flex-direction column
      align-items flex-start
      flex-grow 1

    &__real-name
      font-weight 500
      font-size 13px
      line-height 16px

    &__name
      font-weight normal
      font-size 12px
      line-height 16px

</style>
