<template>
  <div class="push">
    <ui-button
      :type="7"
      class="push__close-button"
      icon="close"
      size="tiny"
      :height="22"
      @click="$emit('button-click')"
    />
    <div class="push__image">
      <svg-icon
        class="push__image__icon"
        name="mic-off"
        size="medium"
      />
    </div>
    <div class="push__content">
      <div class="push__content__header">
        {{ texts.text }}
      </div>
      <div class="push__content__info">
        {{ texts.info }}
      </div>

      <div class="push__button-wrapper">
        <ui-button
          :type="1"
          size="small"
          class="push__button"
          @click="$emit('button-click', {action: 'turn-mic-on'})"
        >
          {{ texts.button1 }}
        </ui-button>
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
      return this.$t('push.mutedTalking');
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
