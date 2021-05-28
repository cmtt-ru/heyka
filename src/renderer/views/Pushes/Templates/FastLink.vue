<template>
  <div
    class="push"
    @click="clickHandler"
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
      <svg-icon
        class="push__image__icon"
        name="link"
        size="medium"
      />
    </div>
    <div class="push__content">
      <div class="push__content__header">
        {{ data.user.name }}
      </div>
      <div class="push__content__info">
        <a>{{ data.data.link }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';

export default {
  components: {
    UiButton,
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
      return this.$t('push.mutedTalking');
    },
  },
  mounted() {
    this.$emit('child-mounted');
  },

  methods: {
    clickHandler() {
      this.$emit('button-click', {
        action: 'mini-chat-link',
        link: this.data.data.link,
      });
    },
  },
};
</script>

<style  lang="stylus" scoped>
@import './push.styl'

.push
  cursor pointer

.push__content__info
  a
    display inline
    color var(--UI-active)

    &:hover
      opacity 0.75

</style>
