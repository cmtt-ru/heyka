<template>
  <div class="performance-monitor scroll">
    <div class="table">
      <table
        cellpadding="0"
        cellspacing="0"
      >
        <tr class="head">
          <th>Process Name</th>
          <th>Template</th>
          <th>Type</th>
          <th>Sub Type</th>
          <th>% CPU</th>
          <th>MEM</th>
        </tr>

        <tr
          v-for="proc in processes"
          :key="proc.pid"
        >
          <td :title="proc.name">
            {{ proc.name }}
          </td>
          <td :title="proc.template">
            {{ proc.template }}
          </td>
          <td :title="proc.type">
            {{ proc.type }}
          </td>
          <td :title="proc.subType">
            {{ proc.subType }}
          </td>
          <td
            class="num"
            style="width: 50px"
          >
            {{ parseFloat(proc.cpu.toFixed(2)) }}
          </td>
          <td
            class="num"
            style="width: 70px"
          >
            {{ parseFloat((proc.mem / 1024).toFixed(2)) }} MB
          </td>
        </tr>
      </table>
    </div>

    <div class="charts">
      <p
        class="charts__label"
      >
        {{ timestamp }}
      </p>
      <p class="charts__label">
        CPU {{ total.cpu.toFixed(2) }} / {{ bgTotal.cpu.toFixed(2) }}%
      </p>
      <TrendChart
        :key="chartKey"
        :datasets="cpuChartLine"
        :grid="chartGrid"
        :labels="{yLabels: 3, yLabelsTextFormatter: val => Math.round(val) + '%'}"
        interactive
        @mouse-move="mouseMoveHandler"
      />

      <br>

      <p class="charts__label">
        MEM {{ (total.mem / 1024).toFixed(2) }} / {{ (bgTotal.mem / 1024).toFixed(2) }} MB
      </p>
      <TrendChart
        :key="chartKey + 1"
        :datasets="memChartLine"
        :grid="chartGrid"
        :labels="{yLabels: 3, yLabelsTextFormatter: val => Math.round(val / 1024) + ' MB'}"
        interactive
        @mouse-move="mouseMoveHandler"
      />

      <div
        class="l-flex l-mt-12 l-pb-8"
        style="align-items: center"
      >
        <ui-button
          size="small l-mr-24 l-ml-auto"
          :type="9"
          @click="loadJsonHandler"
        >
          Load JSON
        </ui-button>

        <div
          class="l-mr-24"
          style="width: 94px"
        >
          <ui-switch
            v-model="realtime"
            text="Realtime"
          />
        </div>

        <div style="width: 74px">
          <ui-switch
            v-model="limit"
            text="Limit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TrendChart from 'vue-trend-chart';
import UiButton from '@components/UiButton';
import UiSwitch from '@components/Form/UiSwitch';

const HISTORY_LIMIT = 100;

const readInputFile = (inputElement, callback) => {
  const reader = new FileReader();

  reader.onload = () => {
    callback(reader.result);
  };
  reader.readAsText(inputElement.files[0]);
};

export const openFile = (callback) => {
  var el = document.createElement('input');

  el.setAttribute('type', 'file');
  el.style.display = 'none';
  document.body.appendChild(el);
  el.onchange = () => {
    readInputFile(el, (data) => {
      callback(data);
      document.body.removeChild(el);
    });
  };
  el.click();
};

export default {
  components: {
    TrendChart,
    UiButton,
    UiSwitch,
  },
  data() {
    return {
      processes: [],
      total: {},
      bgTotal: {},

      cpuChartLine: [
        {
          data: [],
          smooth: true,
          className: 'bg-cpu',
          fill: true,
        },
        {
          data: [],
          smooth: true,
          fill: true,
          className: 'cpu',
        },
      ],

      memChartLine: [
        {
          data: [],
          smooth: true,
          fill: true,
          className: 'bg-mem',
        },
        {
          data: [],
          smooth: true,
          fill: true,
          className: 'mem',
        },
      ],

      chartGrid: {
        // verticalLines: true,
        horizontalLines: true,
      },

      historyArray: [],

      realtime: true,
      limit: true,
      timestamp: null,
      chartKey: 0,
      customJsonLoaded: false,
    };
  },

  watch: {
    async limit(val) {
      const history = await window.ipcRenderer.invoke('performance-monitor-history');

      this.clearHistory();
      this.loadHistory(history, this.limit ? HISTORY_LIMIT : 0);
    },
  },

  async mounted() {
    const history = await window.ipcRenderer.invoke('performance-monitor-history');

    this.loadHistory(history, this.limit ? HISTORY_LIMIT : 0);

    window.ipcRenderer.on('performance-monitor-processes', (event, item) => {
      if (!this.realtime) {
        return;
      }

      this.historyArray.push(item);

      this.total = item.data.slice(-2)[1];
      this.bgTotal = item.data.slice(-2)[0];
      this.processes = item.data.slice(0, -2);

      this.cpuChartLine[0].data.push(Math.max(0, this.bgTotal.cpu));
      this.cpuChartLine[1].data.push(Math.max(0, this.total.cpu));

      this.memChartLine[0].data.push(this.bgTotal.mem);
      this.memChartLine[1].data.push(this.total.mem);
    });
  },

  methods: {
    mouseMoveHandler(obj) {
      if (obj) {
        const item = this.historyArray[obj.index];

        this.total = item.data.slice(-2)[1];
        this.bgTotal = item.data.slice(-2)[0];
        this.processes = item.data.slice(0, -2);
        this.timestamp = item.timestamp;
      } else {
        this.timestamp = null;
      }
    },

    loadJsonHandler() {
      openFile(data => {
        this.realtime = false;

        this.clearHistory();
        this.loadHistory(`[${data.slice(0, -2)}]`);
        this.chartKey = Date.now();
      });
    },

    loadHistory(history, limit = 0) {
      try {
        // eslint-disable-next-line no-magic-numbers
        this.historyArray = JSON.parse(history);

        this.historyArray.slice(-limit).forEach(item => {
          const total = item.data.slice(-2)[1];
          const bgTotal = item.data.slice(-2)[0];

          this.cpuChartLine[0].data.push(bgTotal.cpu);
          this.cpuChartLine[1].data.push(total.cpu);

          this.memChartLine[0].data.push(bgTotal.mem);
          this.memChartLine[1].data.push(total.mem);
        });

        const last = this.historyArray.slice(-1)[0];

        this.total = last.data.slice(-2)[1];
        this.bgTotal = last.data.slice(-2)[0];
        this.processes = last.data.slice(0, -2);
      } catch (err) {
        console.log('Error in parsing history', err);
      }
    },

    clearHistory() {
      this.cpuChartLine[0].data = [];
      this.cpuChartLine[1].data = [];
      this.memChartLine[0].data = [];
      this.memChartLine[1].data = [];
    },
  },
};
</script>

<style lang="stylus">

.performance-monitor
  font-size 12px
  display flex
  flex-direction column
  height 100vh
  background var(--new-black)
  color var(--new-white)

  .table
    flex 1 auto

  table
    width 100%

    th
      font-weight bold
      border-right 1px solid var(--UI-divider-1)
      padding 4px 0
      border-bottom 1px solid var(--UI-divider-1)

      &:last-child
        border-right none

    tr:nth-child(odd):not(.head)
      background var(--UI-divider-1)

    td
      padding 0 10px
      max-width 0
      white-space nowrap
      text-overflow ellipsis
      overflow hidden
      line-height 24px

      &:last-child
        padding-right 16px

      &:first-child
        padding-left 16px

      &.num
        text-align right

  .vtc
    font-size 10px
    height 80px

    .cpu, .mem
      path
        stroke var(--new-UI-01)

      .fill
        fill var(--new-UI-01)
        opacity 0.5

    .bg-cpu, .bg-mem
      path
        stroke var(--UI-divider-1)

      .fill
        fill var(--UI-divider-1)
        opacity 0.9

  .charts
    padding 16px 16px 8px 16px

    &__label
      color var(--new-white)
      margin-top 8px
      font-weight bold

    .active-line
      stroke var(--new-white)

    .label
      fill var(--new-white)
</style>
