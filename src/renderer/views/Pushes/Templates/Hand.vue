<template>
  <div
    class="push"
    @click="$emit('button-click', {action: 'open-grid'})"
  >
    <ui-button
      :type="7"
      class="push__close-button"
      icon="close"
      size="tiny"
      :height="22"
      @click.native.stop="$emit('button-click')"
    />
    <div class="push__image">
      <avatar
        class="push__avatar"
        :user-id="user.id"
        :size="40"
      />
    </div>
    <div class="push__content">
      <div
        v-textfade
        class="push__content__header"
      >
        {{ user.name }}
      </div>
      <div class="push__content__info">
        {{ $t('push.raisedHand') }}
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import Avatar from '@components/Avatar';
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
    /**
     * Get user's info
     * @returns {object}
     */
    user() {
      return this.$store.getters['users/getUserById'](this.data.userId);
    },

  },
  mounted() {
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
  color var(--UI-active)
</style>
