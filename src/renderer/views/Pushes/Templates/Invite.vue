<template>
  <div class="push">
    <ui-button
      :type="7"
      class="push__close-button"
      icon="close"
      size="tiny"
      :height="22"
      @click="$emit('button-click', {action: 'busy', showResponse: true})"
    />
    <div class="push__image">
      <avatar
        class="push__avatar"
        :size="40"
        :image="data.user.avatarSet.image64x64"
        :user-id="data.userId"
      />
    </div>
    <div class="push__content">
      <div class="push__content__header">
        {{ data.user.name }}
      </div>
      <div class="push__content__info">
        <span class="push__info--no-shrink">{{ texts.invitesto }}</span>
        <svg-icon
          name="channelOnAir"
          size="medium"
          class="push__info__icon push__info--no-shrink"
        />
        <span v-textfade>{{ channel.name || data.workspace.name }}</span>
      </div>

      <div class="push__button-wrapper">
        <ui-button
          :type="1"
          size="medium"
          class="push__button"
          @click="$emit('button-click', {action: 'accept-invite'})"
        >
          {{ texts.join }}
        </ui-button>
        <ui-button
          :type="3"
          size="medium"
          class="push__button"
          @click="$emit('button-click', {action: 'busy', showResponse: true})"
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
      userAvatar: 'users/getUserAvatarUrl',
    }),
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('push');
    },

    /**
     * Get user's channel
     * @return {object}
     */
    channel() {
      return this.$store.getters['channels/getChannelById'](this.data.channelId) || { name: null };
    },
  },
  mounted() {
    this.$emit('default-close-response', {
      action: 'busy',
      showResponse: true,
    });
  },
};
</script>

<style  lang="stylus" scoped>
@import './push.styl'
.push

  &__avatar
    display block
    width 40px
    height 40px
    border-radius 4px
    flex-shrink 0

  &__info
    display flex
    align-items center
    color var(--text-1)
    font-size 12px
    line-height 14px
    margin-top 1px
    flex-shrink 0
    white-space nowrap

    &--no-shrink
        flex-shrink 0

    &__icon
      margin-left 4px

</style>
