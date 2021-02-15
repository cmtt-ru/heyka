<template>
  <pseudo-popup @close="closeHandler">
    <template #header>
      Invite to channel
    </template>

    <template #body>
      <tabs>
        <tab
          selected
          name="Guest list"
        />

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
import PseudoPopup from '@components/PseudoPopup';
import { mapGetters } from 'vuex';
import { WEB_URL } from '@sdk/Constants';

export default {
  components: {
    UiButton,
    Tabs,
    Tab,
    PseudoPopup,
  },

  data() {
    return {
      linkCopied: false,
      emails: [ '' ],
      emailsSent: false,
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
    async sendInvites() {
      try {
        await this.$API.workspace.inviteByMail(this.selectedWorkspaceId, [ ...this.emails ]);

        this.emailsSent = true;
      } catch (err) {
        console.log(err);
      }
    },

    resetEmails() {
      this.emails = [ '' ];
      this.emailsSent = false;
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
