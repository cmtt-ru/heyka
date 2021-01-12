<template>
  <pseudo-popup @close="closeHandler">
    <template #header>
      {{ texts.header }}
    </template>

    <template #body>
      <tabs>
        <tab
          selected
          :name="texts.link"
        >
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

        <tab :name="texts.email">
          <ui-form
            v-if="!emailsSent"
            @submit="sendInvites()"
          >
            <editable-list
              v-model="emails"
              :add-text="texts.addEmail"
              email
              placeholder="name@example.com"
              class="email-inputs"
            />
            <ui-button
              :type="1"
              submit
            >
              {{ texts.send }}
            </ui-button>
          </ui-form>
          <div v-if="emailsSent">
            <div class="success">
              {{ texts.sendSuccess }} {{ $tc("workspace.invite.inviteAmount", emails.length) }}
              <svg-icon
                class="success__tick"
                name="check"
                stroke="var(--color-1)"
                size="medium"
              />
            </div>
            <ui-button
              :type="1"
              :wide="true"
              class="link"
              @click="resetEmails"
            >
              {{ texts.moreInvites }}
            </ui-button>
          </div>
        </tab>

        <tab name="Slack">
          <div class="">
            You have no workspaces connected with Slack.
          </div>
          <ui-button
            :type="17"
            :wide="true"
            class="link"
            icon="slack"
            @click="slackConnect"
          >
            Connect with Slack
          </ui-button>
        </tab>
        <tab name="MS Teams">
          Work in progress
        </tab>
      </tabs>
    </template>
  </pseudo-popup>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm } from '@components/Form';
import { Tabs, Tab } from '@components/Tabs';
import EditableList from '@components/List/EditableList';
import PseudoPopup from '@components/PseudoPopup';
import { mapGetters } from 'vuex';
import { WEB_URL } from '@sdk/Constants';
import DeepLink from '@shared/DeepLink/DeepLinkRenderer';

export default {
  components: {
    UiButton,
    UiForm,
    Tabs,
    Tab,
    EditableList,
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
      return this.$t('workspace.invite');
    },

  },

  mounted() {
    DeepLink.on('slack-connect', ([status, error]) => {
      if (status === 'false') {
        this.$store.dispatch('app/addNotification', {
          data: {
            text: decodeURIComponent(error),
          },
        });
      }
    });
  },

  beforeDestroy() {
    DeepLink.removeAllListeners('slack-connect');
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

    async slackConnect() {
      const url = await this.$API.workspace.connectWithSlack(this.selectedWorkspaceId);

      console.log(url);

      navigator.clipboard.writeText(url.redirect);
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
