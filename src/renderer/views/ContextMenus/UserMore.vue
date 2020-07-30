<template>
  <popover>
    <div class="buttons">
      <router-link :to="{ name: 'edit-profile'}">
        <ui-button
          :type="11"
        >
          {{ texts.edit }}
        </ui-button>
      </router-link>
    </div>
  </popover>
</template>

<script>
import Popover from '@components/Popover';
import UiButton from '@components/UiButton';
export default {
  components: {
    Popover,
    UiButton,
  },
  computed: {
    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('popover.userMore');
    },
  },
};
</script>