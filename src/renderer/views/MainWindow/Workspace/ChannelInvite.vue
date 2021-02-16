<template>
  <pseudo-popup @close="closeHandler">
    <template #header>
      Invite to channel
    </template>

    <template #body>
      <tabs>
        <tab
          selected
          name="User list"
        >
          <div class="user-search__wrapper">
            <ui-input
              ref="top_slack_invite"
              v-model="filterKey"
              icon="search"
              placeholder="Search"
              class="user-search"
            />
          </div>
          <list
            ref="userList"
            class="user-list"
            selectable
            :filter-by="filterKey"
            @multipick="selectUser"
          >
            <list-item
              v-for="user in getAllUsers"
              :key="user.id"
              :filter-key="user.name"
              :selectable-content="user"
              button
              class="user"
            >
              <avatar
                class="user__avatar"
                :image="userAvatar(user.id, 32)"
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
                  {{ user.name }}
                </div>
                <div class="user__name">
                  @{{ user.id }}
                </div>
              </div>
              <svg-icon
                class="user__check"
                name="check"
                width="15"
                height="15"
              />
            </list-item>
          </list>
          <div
            class="submit-button-wrapper"
          >
            <ui-button
              :type="1"
              :disabled="!selectedUsers.length"
              @click="sendOneInvite"
            >
              {{ $tc("slackInvite.inviteUsers", selectedUsers.length) }}
            </ui-button>
          </div>
        </tab>

        <tab name="Guest link">
          <div class="link-wrapper">
            <ui-button
              v-show="!linkCopied"
              :type="1"
              :wide="true"
              class="link"
              @click="copyLinkHandler"
            >
              {{ texts.copy }}
            </ui-button>
            <ui-button
              v-show="linkCopied"
              :type="5"
              :wide="true"
              class="link"
              @click="copyLinkHandler"
            >
              {{ texts.copied }}
            </ui-button>
          </div>
          <div
            v-show="linkCopied"
            class="link__copied-text"
          >
            {{ texts.expires }}
          </div>
        </tab>
      </tabs>
    </template>
  </pseudo-popup>
</template>

<script>
import UiButton from '@components/UiButton';
import { Tabs, Tab } from '@components/Tabs';
import { List, ListItem } from '@components/List';
import { UiInput } from '@components/Form';
import Avatar from '@components/Avatar';
import PseudoPopup from '@components/PseudoPopup';
import { mapGetters } from 'vuex';
import { WEB_URL } from '@sdk/Constants';

export default {
  components: {
    UiButton,
    Tabs,
    Tab,
    List,
    ListItem,
    UiInput,
    Avatar,
    PseudoPopup,
  },

  data() {
    return {
      filterKey: '',
      linkCopied: false,
      selectedUsers: [],
    };
  },

  computed: {
    ...mapGetters({
      selectedWorkspaceId: 'me/getSelectedWorkspaceId',
      getAllUsers: 'users/getAllUsers',
      userAvatar: 'users/getUserAvatarUrl',
    }),

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('workspace.channelInvite');
    },

  },

  methods: {
    async copyLinkHandler() {
      try {
        const codeData = await this.$API.workspace.inviteByCode(this.selectedWorkspaceId);

        const link = `${WEB_URL}/auth?invite=${codeData.code}`;

        navigator.clipboard.writeText(link);
        this.linkCopied = true;
      } catch (err) {
        console.log(err);
      }
    },

    selectUser(data) {
      this.selectedUsers = data;
    },

    async sendOneInvite() {
      try {
        for (const user of this.selectedUsers) {
          await this.$API.workspace.inviteSlackUser(this.selectedWorkspaceId, { slackUserId: user.id });
        }
        this.invitesSentTo = [...this.invitesSentTo, ...this.selectedUsers.map(el => el.id)];
        this.selectedUsers = [];
        document.getElementsByClassName('pseudo-popup__body')[0].scrollTo(0, 0);
      } catch (err) {
        console.error(err);
      }
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
  position sticky
  top -0.5px
  z-index 10

/deep/ .input
  padding-left 54px

/deep/ .input__icon
  padding-left 10px

.user-list
  margin-bottom 65px

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
    padding 1px
    box-sizing border-box
    flex-shrink 0
    color var(--new-bg-04)
    border 1px solid var(--new-UI-05)
    border-radius 50%

  &.list-item--selected
    background-color initial

    &:hover
      background-color var(--new-UI-06)

    & .user__check
      background-color var(--new-UI-01)
      color var(--new-UI-09)
      padding 2px
      border none

  &__avatar
    margin-right 12px
    flex-shrink 0

  &__inner
    display flex
    flex-direction column
    align-items flex-start
    flex-grow 1

.link-wrapper
  width 200px
  margin 20px auto 20px 0

.link__copied-text
  font-size 12px
  margin-top 20px
  color var(--text-1)

.email-inputs
  margin-bottom 30px

.success
  display inline-block
  margin-bottom 16px

  &__tick
    transform translateY(2px)

</style>
