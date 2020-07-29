<template>
  <div
    v-click-outside="hide"
    class="dropdown"
    :class="{'dropdown--disabled': disabled}"
  >
    <div
      class="dropdown__header"
      :class="{'ui-error': errorText}"
      @click="headerClickHandler()"
    >
      <div v-textfade>
        {{ selectedText }}
      </div>
      <svg-icon
        class="dropdown__header__icon"
        name="arrow-down"
      />
    </div>

    <div
      v-if="errorText"
      class="error-text"
    >
      {{ errorText }}
    </div>

    <div
      class="dropdown__list"
      :class="{'dropdown__list--visible': visible}"
    >
      <div
        v-for="item in data"
        :key="item.value"
        class="dropdown__item"
        @click="variantClickHandler(item)"
      >
        <div v-textfade>
          {{ item.name }}
        </div>
        <svg-icon
          v-if="item == selectedItem"
          class="dropdown__item__icon"
          name="check"
          size="medium"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuid4 } from 'uuid';

export default {

  props: {
    /**
     * Array with {name, value}
     */
    data: {
      type: Array,
      required: true,
    },

    /**
     * Select's initial state (selected item)
     */
    value: {
      type: String,
      default: null,
    },

    /**
     * Initial text if no item is selected
     */
    text: {
      type: String,
      default: null,
    },

    /**
     * Make whole dropdown inactive
     */
    disabled: {
      type: Boolean,
      default: false,
    },

    /**
     * true if field is required
     */
    required: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      id: uuid4(),
      validate: this.required,
      errorText: null,
      listNode: {},
      arrowNode: {},
      visible: false,
    };
  },

  computed: {

    /**
     * Get needed texts from I18n-locale file
     * @returns {object}
     */
    texts() {
      return this.$t('inputErrors');
    },

    /**
     * Local copy of selected variant's value
     * @returns {string} value
     */
    localValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.hide();
        this.$emit('input', value);
      },
    },

    selectedItem() {
      return this.data.find((el) => {
        if (el.value === this.localValue) {
          return el;
        }
      }) || null;
    },
    /**
     * Text to display on top selection. Can be selected item or initial text before first selection.
     * @returns {string} text to display
     */
    selectedText() {
      if (this.selectedItem) {
        return this.selectedItem.name;
      }

      return this.text;
    },

  },

  mounted() {
    /* Store locally refs to sropdown and icon elements, we need them on every 'open' event */
    this.listNode = this.$el.querySelector('.dropdown__list');
    this.arrowNode = this.$el.querySelector('.dropdown__header__icon');
  },

  methods: {
    /**
     * We clicked header (open/close toggle)
     * @returns {void}
     */
    headerClickHandler() {
      this.toggle();
    },

    /**
     * We clicked one of the variants
     * @param {object} item item which we clicked
     * @returns {void}
     */
    variantClickHandler(item) {
      if (!this.value) {
        this.$parent.$emit('ui-error', this.id, false);
        this.errorText = null;
      }
      this.localValue = item.value;
    },

    /**
     * Change select's state (open <-> close)
     * @returns {void}
     */
    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
    },

    /**
     * Open select. We need to do a lot of shenanigans so that dropdown part is fully visible. If not, make it dropUP. And turn the arrow upside down.
     * @returns {void}
     */
    show() {
      this.visible = true;
      /* By default dropdown is UNDER select header, and arrow icon is pointing down */
      this.listNode.style.top = '100%';
      this.listNode.style.bottom = 'unset';
      this.arrowNode.style.transform = 'rotate(0deg)';

      this.$nextTick(() => {
        const position = this.listNode.getBoundingClientRect();

        // Next tick after showing dropdown we check if it is fully visible.
        // If not - put it on top of select and rotate arrow by 180 deg.
        if (position.bottom > window.innerHeight || position.top <= 0) {
          this.listNode.style.top = 'unset';
          this.listNode.style.bottom = '100%';
          this.arrowNode.style.transform = 'rotate(180deg)';
        }
      });
    },

    /**
     * Hide select
     * @returns {void}
     */
    hide() {
      this.visible = false;
    },

    /**
     * Check input for empty value (if it is required)
     * Also, edit error text accordingly
     *
     * @returns {boolean} true if found any errors
     */
    checkErrors() {
      this.errorText = null;
      if (this.required === true && !this.value) {
        this.errorText = this.texts['required'];
        this.$parent.$emit('ui-error', this.id, true);

        return true;
      } else {
        return false;
      }
    },
  },

};
</script>

<style lang="stylus" scoped>
.dropdown
  position relative

  &--disabled
    opacity 0.5
    pointer-events none

  &__header
    background-color var(--input)
    cursor pointer
    height 32px
    box-sizing border-box
    border-radius 4px
    padding 7px 12px
    border 1px solid var(--stroke-3)
    display flex
    flex-direction row
    justify-content space-between
    align-items center
    overflow hidden

    &:hover
      background-color var(--button-bg-4)

    &__icon
      color var(--icon-1)
      margin-left 8px

  black = var(--icon-1)

  &__list
    position absolute
    background-color var(--app-bg)
    top 100%
    left 0
    right 0
    z-index 99
    border-radius 4px
    border 1px solid var(--shadow-20)
    box-shadow 0px 3px 8px var(--shadow-15), 0px 0px 8px var(--shadow-15)
    overflow hidden
    display none
    margin 6px 0
    padding 4px
    max-height 300px // TODO: дождаться варианта покрасивее от Кости
    overflow-y auto

    &--visible
      display block

  &__item
    padding 8px 8px
    border-radius 4px
    box-sizing border-box
    height 32px
    cursor pointer
    display flex
    flex-direction row
    justify-content space-between
    align-items center

    &:hover
      background-color var(--item-bg-hover)

    &__icon
      color var(--color-1)

.text-ellipsis
  white-space nowrap
  text-overflow ellipsis
  overflow hidden

.ui-error
  border-color var(--color-0)

.error-text
  color var(--text-tech-0)
  font-size 10px
  line-height 12px
  min-height 16px
  padding-top 6px
  display flex
  flex-direction column
  justify-content center
  align-items flex-start
</style>
