<template>
  <pseudo-popup
    :header-has-shadow="false"
    cancel-text
    @close="closeHandler"
  >
    <template #header>
      {{ texts.header }}
    </template>

    <template #body>
      <tabs>
        <tab
          selected
          :name="texts.link"
        >
          <div
            class="link__header"
          >
            {{ texts.linkHeader }}
          </div>
          <div class="link-wrapper">
            <ui-button
              :type="1"
              :wide="true"
              size="large"
              class="link"
              @click="copyLinkHandler"
            >
              {{ texts.copy }}
            </ui-button>
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
              :wide="true"
              size="large"
              submit
            >
              {{ texts.send }}
            </ui-button>
          </ui-form>
          <div v-if="emailsSent">
            <div class="success">
              {{ texts.sendSuccess }} {{ $tc("workspace.invite.inviteAmount", emails.length) }}
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
          <slack-invite />
        </tab>
        <!-- <tab name="Teams">
          Work in progress
        </tab> -->
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
import SlackInvite from './SlackInvite';

export default {
  components: {
    UiButton,
    UiForm,
    Tabs,
    Tab,
    EditableList,
    PseudoPopup,
    SlackInvite,
  },

  data() {
    return {
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

  methods: {
    async copyLinkHandler() {
      try {
        const codeData = await this.$API.workspace.inviteByCode(this.selectedWorkspaceId);

        const link = `${WEB_URL}/auth?invite=${codeData.code}`;

        navigator.clipboard.writeText(link);

        const notification = {
          data: {
            text: this.texts.expires,
            icon: 'tick',
          },
        };

        await this.$store.dispatch('app/addNotification', notification);
      } catch (err) {
        console.log(err);
      }
    },
    async sendInvites() {
      try {
        await this.$API.workspace.inviteByMail(this.selectedWorkspaceId, [ ...this.emails ]);

        this.emailsSent = true;
      } catch (err) { }
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
      this.__backOrRedirect();
    },
  },

};
</script>

<style lang="stylus" scoped>
.link-wrapper
  padding 12px 0

.link__header
  padding 4px

.email-inputs
  margin-bottom 30px

.success
  display inline-block
  margin-bottom 16px

  &__tick
    transform translateY(2px)

</style>
