<template>
  <div
    v-if="matchesFilter"
    class="list-item"
    :class="{'list-item--selected': selected}"
    @click="clickHandler()"
  >
    <slot />
  </div>
</template>

<script>
/* eslint-disable no-magic-numbers */

import levenshtein from 'fast-levenshtein';
import * as cyrillicToTranslit from 'cyrillic-to-translit-js';

// TODO: save closest levenshtein distance across all methods and sort parent's list by this distance

// https://github.com/farzher/fuzzysort
// https://github.com/ai/convert-layout
// https://www.npmjs.com/package/cyrillic-to-translit-js

const EN_MAP = ['`', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', '\\', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '~', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', '|', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?'];
const RU_MAP = ['ё', 'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', '\\', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.', 'Ё', 'Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ', 'Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э', '/', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', ','];

const LAYOUTS = [EN_MAP, RU_MAP];

export default {

  props: {
    /**
     * Key for list searching/filtering. In most cases it is just text on the list-item
     */
    filterKey: {
      type: String,
      default: '',
    },
  },
  data: function () {
    return {
      /**
     * Whether item is selected (for multi pick, eg. when sending invites to multiple people)
     */
      selected: false,
      parent: this.$parent,
      lang: {},

    };
  },
  computed: {

    /**
     * Get Parent's filter string
     * @returns {string}
     */
    parentFilterBy() {
      return this.parent.filterBy || '';
    },

    /**
     * Compute search substring's language
     * @returns {object}
     */
    parentlang() {
      return this.detectLang(this.parentFilterBy);
    },

    /**
     * convert parent's substring to item's language for wrong-layout-check
     * @returns {string}
     */
    switchedParentLayout() {
      return this.parentFilterBy.split('').map((sym) => {
        const ind = this.parentlang.arr.indexOf(sym);

        if (ind === -1) {
          return sym;
        } else {
          return this.lang.arr[ind];
        }
      })
        .join('');
    },

    /**
     * Decide if item matches List's filter
     * @returns {boolean}
     */
    matchesFilter() {
      if (!this.parentFilterBy.length) {
        return true;
      }

      /* Simple comparison */
      if (this.similarity(this.filterKey, this.parentFilterBy)) {
        return true;
      }

      /* Comparison with ru->en translit */
      if (this.parentlang.code === 'ru' && this.lang.code === 'en') {
        if (this.similarity(this.filterKey, cyrillicToTranslit().transform(this.parentFilterBy))) {
          return true;
        }
      }

      /* Comparison with en->ru translit */
      if (this.parentlang.code === 'en' && this.lang.code === 'ru') {
        if (this.similarity(this.filterKey, cyrillicToTranslit().reverse(this.parentFilterBy))) {
          return true;
        }
      }

      /* Comparison with accidentally incorrect layout */
      if (this.parentlang.code !== this.lang.code) {
        if (this.similarity(this.filterKey, this.switchedParentLayout)) {
          return true;
        }
      }

      return false;
    },

  },

  mounted() {
    this.lang = this.detectLang(this.filterKey);
  },

  methods: {

    /**
     * Compare substring with string
     * @param {string} string item's string
     * @param {string} substring substring to compare to
     * @returns {boolean}
     */
    similarity(string, substring) {
      const str = string.toLowerCase();
      const substr = substring.toLowerCase();

      /* Check for pure substring */
      if (str.includes(substr)) {
        return true;
      }

      /* Check for substring with levenshtein distance less than ((N+3)/5), where N = substring length */
      const len = substr.length;

      for (let i = 0; i < str.length; i++) {
        if (str[i] === substr[0]) {
          const error = Math.round(len / 5);

          // we need to check several substrings of full strings: similar to substr length, but plus/minus possible levenstein error
          for (let l = len - error; l <= len + error; l++) {
            const strPiece = str.substring(i, i + l);

            if (levenshtein.get(substr, strPiece, { useCollator: true }) <= error) {
              return true;
            }
          }
        }
      }

      return false;
    },

    /**
     * Try to guess string's language.
     * Pretty lazy for now (we check first symbol)
     * @param {string} str string to check
     * @returns {object}
     */
    detectLang(str) {
      for (let k = 0; k < LAYOUTS.length; k++) {
        if (LAYOUTS[k].includes(str[0])) {
          if (k === 0) {
            return {
              code: 'en',
              arr: LAYOUTS[0],
            };
          } else if (k === 1) {
            return {
              code: 'ru',
              arr: LAYOUTS[1],
            };
          } else {
            return {
              code: '',
              arr: LAYOUTS[k],
            };
          }
        }
      }

      return {
        code: 'en',
        arr: LAYOUTS[0],
      };
    },

    /**
     * Change 'selected' state
     * @returns {string}
     */
    clickHandler() {
      if (!this.parent.selectable) {
        return;
      }
      this.selected = !this.selected;
      this.parent.$emit('selected');
    },
  },

};
</script>

<style lang="stylus" scoped>
.list-item
  display flex
  flex-direction row
  justify-content flex-start
  align-items center
  border-radius 4px
  box-sizing border-box

  &--selected
    background-color var(--item-bg-multi-pick)
</style>
