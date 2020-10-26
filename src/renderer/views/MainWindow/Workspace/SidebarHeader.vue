<template>
  <div class="workspace">
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
        @keydown.native.esc="closeInput()"
      />
      <ui-button
        v-show="inputActive"
        :type="7"
        class="workspace__search__icon workspace__search__icon--close"
        size="small"
        height="16"
        icon="clear"
        @click.native="closeInput()"
      />
    </div>

    <div
      v-show="!inputActive"
      class="workspace__wrapper"
    >
      <ui-button

        v-tooltip="$t('tooltips.search')"
        :type="7"
        class="workspace__search__icon"
        size="small"
        icon="search"
        @click.native="activateInput()"
      />
      <div>Search</div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import { UiInput } from '@components/Form';
import { mapGetters } from 'vuex';

export default {
  components: {
    UiButton,
    UiInput,
  },

  data() {
    return {
      inputActive: false,
    };
  },

  computed: {

    ...mapGetters([ 'myWorkspace' ]),

    /**
     * Search string in vuex
     *
     * @returns {string}
     */
    searchText: {
      get() {
        return this.$store.state.app.search;
      },
      set(value) {
        this.$store.commit('app/SET_SEARCH_TEXT', value);
      },
    },
  },

  methods: {

    /**
     * Show searchbar
     * @returns {void}
     */
    activateInput() {
      this.searchText = '';
      this.inputActive = true;
      this.$nextTick(() => {
        this.$refs.globalSearch.focusInput();
      });
    },

    /**
     * Close searchbar if it is empty
     * @returns {void}
     */
    deactivateInput() {
      if (this.searchText === '') {
        this.inputActive = false;
      }
    },

    /**
     * Close searchbar
     * @returns {void}
     */
    closeInput() {
      this.searchText = '';
      this.inputActive = false;
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
    margin 4px
    position relative
    height 24px

    &__wrapper
        cursor pointer
        display flex
        flex-direction row
        justify-content space-between
        align-items center
        -webkit-app-region no-drag

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
        top 0
        width 100%
        height 100%
        right 0
        z-index 1
        pointer-events none

        &__input
          pointer-events auto
          background-color var(--button-bg-3)
          -webkit-app-region no-drag

        &__icon

          &--close
            top 8px
            right 8px

/deep/ .input
  padding-right 26px

</style>
