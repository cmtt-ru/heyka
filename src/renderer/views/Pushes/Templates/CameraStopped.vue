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
        name="video-off"
        size="medium"
      />
    </div>
    <div class="push__content">
      <div class="push__content__info">
        {{ texts.text }}
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

  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('push.cameraStopped');
    },
  },

  mounted() {
    this.$emit('child-mounted');
  },
};
</script>

<style  lang="stylus" scoped>
@import './push.styl'

</style>
