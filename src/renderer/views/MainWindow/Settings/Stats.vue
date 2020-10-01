<template>
  <div class="settings-page">
    <div class="l-flex">
      <ui-button
        :type="15"
        size="small"
        :active="activeTab === 'all'"
        @click="activeTabHandler('all')"
      >
        All
      </ui-button>

      <ui-button
        :type="15"
        size="small"
        :active="activeTab === 'auto'"
        @click="activeTabHandler('auto')"
      >
        Auto
      </ui-button>

      <ui-button
        :type="15"
        size="small"
        :active="activeTab === 'user'"
        @click="activeTabHandler('user')"
      >
        User
      </ui-button>

      <ui-button
        :type="6"
        size="small"
        class="l-ml-auto"
        @click="loadData"
      >
        Refresh
      </ui-button>
    </div>

    <div class="stats">
      <div
        v-for="stat in filteredStats"
        :key="stat.date"
        class="stats__item"
        :class="{'stats__item--more': stat.more}"
      >
        <div
          class="stats__item__short"
          @click="showMore(stat)"
        >
          <div class="stats__item__name">
            {{ userName(stat.userId) }}
          </div>
          <div class="stats__item__date">
            {{ dateFormat(stat.date) }}
          </div>
          <div
            class="stats__item__bitrate"
            :style="{'color': stat.meanBitrate < 36 ? 'var(--color-0)' : null}"
          >
            {{ Math.round(stat.meanBitrate) }}
          </div>
        </div>

        <div
          v-if="stat.more"
          class="stats__item__more"
        >
          <table class="stats__item__table">
            <thead>
              <td>input</td>
              <td>output</td>
              <td>lost</td>
            </thead>
            <tr
              v-for="(ci, i) in stat.connectionInfo"
              :key="i"
            >
              <td>{{ ci.input }}</td>
              <td :style="{'font-weight': ci.output < 36 ? 500 : null}">
                {{ ci.output }}
              </td>
              <td :style="{'font-weight': ci.lost > 0 ? 500 : null}">
                {{ ci.lost }}
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UiButton from '@components/UiButton';
import dateFormat from 'dateformat';
import Vue from 'vue';

export default {
  components: {
    UiButton,
  },
  data() {
    return {
      stats: [],
      activeTab: 'all',
    };
  },
  computed: {
    filteredStats() {
      if (this.activeTab === 'all') {
        return this.stats;
      }

      return this.stats.filter(s => s.triggerType === this.activeTab);
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const stats = await this.$API.app.getStats();

      console.log(stats);
      this.stats = stats;
    },

    userName(id) {
      const user = this.$store.getters['users/getUserById'](id);

      if (user) {
        return user.name;
      }

      return 'Unknown';
    },

    /**
     * Format date
     * @param {string} date – date
     * @returns {string}
     */
    dateFormat(date) {
      return dateFormat(new Date(date), 'dd.mm.yy HH:MM:ss');
    },

    showMore(stat) {
      console.log(stat);
      Vue.set(stat, 'more', !stat.more);
    },

    activeTabHandler(name) {
      this.activeTab = name;
    },
  },
};
</script>

<style scoped lang="stylus">
  @import './styles'

  .stats
    margin-top 12px

    &__item
      border-bottom 1px solid var(--line-stroke)

      &__short
        display flex
        align-items baseline
        cursor pointer
        padding 8px

      &__name
      &__date
        overflow hidden
        text-overflow ellipsis
        white-space nowrap
        margin-right 12px

      &__name
        font-weight 500

      &__date
        font-size 12px

      &__bitrate
        flex 0 0 auto
        margin-left auto
        font-weight 500

      &__more
        padding 0 8px 8px 8px

      &__table
        font-size 12px
        border-collapse collapse
        line-height 1.5

        thead
          font-weight 500

          td
            text-align left

        td
          padding-right 8px
          text-align center

      &--more
        background var(--input)

        //.stats__item__short
        //  background var(--button-bg-4)

      &:first-child {
        border-top 1px solid var(--line-stroke)
      }
</style>
