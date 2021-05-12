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
      <p class="charts__label">
        CPU {{ total.cpu.toFixed(2) }}%
      </p>
      <TrendChart
        :key="total.cpu"
        :datasets="cpuChartLine"
        :grid="chartGrid"
        :labels="{yLabels: 3, yLabelsTextFormatter: val => Math.round(val) + '%'}"
      />

      <br>

      <p class="charts__label">
        MEM {{ (total.mem / 1024).toFixed(2) }} MB
      </p>
      <TrendChart
        :key="total.mem"
        :datasets="memChartLine"
        :grid="chartGrid"
        :labels="{yLabels: 3, yLabelsTextFormatter: val => Math.round(val / 1024) + ' MB'}"
      />
    </div>
  </div>
</template>

<script>
import TrendChart from 'vue-trend-chart';

export default {
  components: {
    TrendChart,
  },
  data() {
    return {
      processes: [],
      total: {},

      cpuChartLine: [
        {
          data: [0, 0],
          smooth: false,
          className: 'cpu',
        },
      ],

      memChartLine: [
        {
          data: [0, 0],
          smooth: false,
          className: 'mem',
        },
      ],

      chartGrid: {
        // verticalLines: true,
        horizontalLines: true,
      },

    };
  },

  async mounted() {
    const history = await window.ipcRenderer.invoke('performance-monitor-history');

    try {
      const historyArray = JSON.parse(history);

      historyArray.forEach(item => {
        const total = item.splice(-1)[0];

        this.cpuChartLine[0].data.push(total.cpu);
        this.memChartLine[0].data.push(total.mem);

        console.log(this.cpuChartLine[0].data);
      });

      const last = historyArray.slice(-1)[0];

      this.total = last.splice(-1)[0];
      this.processes = last;
    } catch (err) {
      console.log('Error in parsing history', err);
    }

    window.ipcRenderer.on('performance-monitor-processes', (event, data) => {
      this.total = data.splice(-1)[0];
      this.processes = data;

      this.cpuChartLine[0].data.push(this.total.cpu);
      this.memChartLine[0].data.push(this.total.mem);
    });
  },

  methods: {

  },
};
</script>

<style lang="stylus">

.performance-monitor
  font-size 12px
  display flex
  flex-direction column
  height 100vh

  .table
    flex 1 auto

  table
    width 100%

    th
      font-weight bold
      border-right 1px solid #ddd
      padding 4px 0
      border-bottom 1px solid #ddd

      &:last-child
        border-right none

    tr:nth-child(odd):not(.head)
      background #eee

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

  .charts
    padding 16px 16px 8px 16px

    &__label
      margin-top 8px
      font-weight bold

</style>
