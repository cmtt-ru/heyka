<template>
  <div>
    <div class="push__content">
      <div class="push__col">
        {{ texts.text }}
      </div>
      <div class="push__button-wrapper">
        <ui-button
          :type="1"
          size="medium"
          class="push__button"
          @click="$emit('buttonClick', {action: 'turn-mic-on'})"
        >
          {{ texts.button1 }}
        </ui-button>
        <ui-button
          :type="3"
          size="medium"
          class="push__button"
          @click="$emit('buttonClick')"
        >
          {{ texts.button2 }}
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
};
</script>

<style  lang="stylus" scoped>

.push

  &__content
    display flex

  &__col
      margin-left 8px

  &__button-wrapper
    flex-shrink 0
    flex-grow 0
    margin-left 8px

  &__button
    margin 0 4px

</style>
