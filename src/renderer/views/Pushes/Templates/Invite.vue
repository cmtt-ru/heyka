<template>
  <div class="push">
    <ui-button
      :type="7"
      class="push__close-button"
      icon="close"
      size="tiny"
      :height="22"
      @click="$emit('button-click', {action: 'busy', showResponse: true, text: 'declined'})"
    />
    <div class="push__image">
      <avatar
        class="push__avatar"
        :user-id="data.userId"
        :size="40"
      />
      <avatar
        v-if="data.workspaceId !== workspaceId"
        class="push__avatar--workspace"
        :user-id="data.workspaceId"
        :size="16"
      />
    </div>
    <div class="push__content">
      <div
        v-textfade
        class="push__content__header"
      >
        {{ data.user.name }}
      </div>
      <div class="push__content__info">
        <span class="push__content__info--no-shrink">{{ texts.invitesto }}</span>
        <svg-icon
          name="channel"
          size="medium"
          class="push__content__info__icon push__content__info--no-shrink"
        />
        <span v-textfade>{{ data.channel.name }}</span>
      </div>

      <div class="push__button-wrapper">
        <ui-button
          :type="1"
          size="small"
          class="push__button"
          @click="$emit('button-click', {action: 'accept-invite'})"
        >
          {{ texts.join }}
        </ui-button>
        <ui-button
          :type="2"
          size="small"
          class="push__button"
          @click="$emit('button-click', {action: 'busy', text: 'busy', showResponse: true})"
        >
          {{ texts.busy }}
        </ui-button>
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
import { mapGetters } from 'vuex';
import { getUserAvatarUrl } from '@libs/image';

export default {
  components: {
    UiButton,
    Avatar,
  },
  props: {
    /**
      * Inner data with "user", "channel" and "buttons"
    */
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      workspaceId: 'me/getSelectedWorkspaceId',
    }),
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('push');
    },

  },
  mounted() {
    this.$emit('default-close-response', {
      action: 'busy',
      showResponse: true,
      text: 'declined',
    });
    this.$emit('child-mounted');
  },
  methods: {
    avatarUrl: getUserAvatarUrl,
  },
};
</script>

<style  lang="stylus" scoped>
@import './push.styl'
.push__content__info
    display flex
    align-items center
    margin-top 1px
    flex-shrink 0
    white-space nowrap

    &--no-shrink
        flex-shrink 0

    &__icon
      margin-left 4px
      color var(--UI-active)

</style>
