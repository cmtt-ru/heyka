<template>
  <div class="l-p-8 l-fw-m">
    <div
      v-if="workspace"
      class="workspace"
    >
      <div
        v-click-outside="deactivateInput"
        class="workspace__search"
      >
        <ui-input
          v-show="inputActive"
          ref="globalSearch"
          v-model="searchText"
          class="workspace__search__input"
          placeholder="Search"
          icon="search"
          @keydown.native.esc="clearInput();deactivateInput()"
        />
        <ui-button
          v-show="inputActive"
          :type="7"
          class="workspace__search__icon workspace__search__icon--close"
          size="small"
          height="16"
          icon="close"
          @click.native="clearInput()"
        />
        <ui-button
          v-show="!inputActive"
          :type="7"
          class="workspace__search__icon"
          size="small"
          icon="search"
          @click.native="activateInput()"
        />
      </div>

      <div
        v-popover.click="{name: 'Workspace'}"
        class="workspace__wrapper"
      >
        <img
          class="workspace__avatar"
          :src="workspace.avatar"
        >
        <div>{{ workspace.name }}</div>
        <ui-button
          :type="7"
          class="workspace__expand"
          size="small"
          height="16"
          icon="arrow-down"
        />
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiInput } from '@components/Form';

export default {
  components: {
    UiButton,
    UiInput,
  },

  data() {
    return {
      searchText: '',
      inputActive: false,
    };
  },

  computed: {
    /**
     * Get current workspace instance
     * @returns {object}
     */
    workspace() {
      const channelId = this.$store.getters['me/getSelectedWorkspaceId'];

      return this.$store.getters['workspaces/getWorkspaceById'](channelId);
    },
  },

  watch: {
    /**
     * Update search string in vuex
     * @param {string} newValue newValue
     * @param {string} oldValue oldValue
     * @returns {void}
     */
    searchText(newValue, oldValue) {
      this.$store.commit('app/SET_SEARCH_TEXT', newValue);
    },
  },

  methods: {
    /**
     * Popover creation
     * @returns {void}
     */
    dropdownHandler() {
      this.$router.push('/main-window/settings/');
    },

    /**
     * Show searchbar
     * @returns {void}
     */
    activateInput() {
      this.inputActive = true;
      this.$nextTick(() => {
        this.$refs.globalSearch.focusInput();
      });
    },

    /**
     * Hide searchbar if it is empty
     * @returns {void}
     */
    deactivateInput() {
      if (this.searchText === '') {
        this.inputActive = false;
      }
    },

    /**
     * Clear searchbar
     * @returns {void}
     */
    clearInput() {
      this.searchText = '';
    },
  },

};
</script>

<style lang="stylus" scoped>

.workspace
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    padding 0 4px
    position relative
    height 24px

    &__wrapper
        cursor pointer
        display flex
        flex-direction row
        justify-content space-between
        align-items center

    &__expand
        margin-left 4px
        margin-top 1px

    &__avatar
        width 14px
        height 14px
        border-radius 2px
        margin-right 6px

    &__search
        position absolute
        top -4px
        bottom 0
        width 100%
        height 100%
        right 0
        pointer-events none

        &__input
          pointer-events auto
          background-color var(--text-tech-3)

        &__icon
          pointer-events auto
          position absolute
          right 0
          top 4px

          &--close
            top 8px
            right 8px

</style>

<style lang="stylus">
.workspace__search__input .input
  padding-right 26px
</style>