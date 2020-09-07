<template>
  <div
    class="l-p-12"
  >
    <div class="tab">
      <div class="link-wrapper">
        <ui-button
          v-show="!linkCopied"
          :type="1"
          :wide="true"
          class="link"
          @click="copyLinkHandler"
        >
          Copy invite link
        </ui-button>
        <ui-button
          v-show="linkCopied"
          :type="5"
          :wide="true"
          class="link"
          @click="copyLinkHandler"
        >
          Copied!
        </ui-button>
      </div>
      <div
        v-show="linkCopied"
        class="link__copied-text"
      >
        Your invite link expires in 1 day
      </div>
    </div>

    <div class="tab l-p-12">
      <ui-form
        v-if="!emailsSent"
        @submit="sendInvites()"
      >
        <editable-list
          v-model="emails"
          add-text="Add email"
          email
          placeholder="name@example.com"
          class="email-inputs"
        />
        <ui-button
          :type="1"
          submit
        >
          Send
        </ui-button>
      </ui-form>
      <div v-if="emailsSent">
        <div class="success">
          You have successfully sent 3 invitations
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
          Send more invites
        </ui-button>
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiForm } from '@components/Form';
import EditableList from '@components/List/EditableList';
import { mapGetters } from 'vuex';

export default {
  components: {
    UiButton,
    UiForm,
    EditableList,
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
      return this.$t('workspace.user');
    },

  },

  methods: {
    async copyLinkHandler() {
      try {
        const link = await this.$API.workspace.inviteByCode(this.selectedWorkspaceId);

        console.log(link);
        navigator.clipboard.writeText(link.code);
        this.linkCopied = true;
      } catch (err) {
        console.log(err);
      }
    },
    sendInvites() {
      console.log([ ...this.emails ]);
      this.emailsSent = true;
    },

    resetEmails() {
      this.emails = [ '' ];
      this.emailsSent = false;
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
