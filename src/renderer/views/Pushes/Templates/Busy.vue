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
        :image="avatarUrl(user, 40)"
        :user-id="user.id"
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
        {{ texts[data.text] }}
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
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('push');
    },
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
</style>
