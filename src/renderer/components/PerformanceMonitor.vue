<template>
  <div
    v-if="IS_DEV"
    class="stat"
  >
    <p>CPU: {{ totalCpuUsage }}%</p>
    <p>AVG: {{ avgCpuUsage }}%</p>
    <p>MEM: {{ totalMemUsage }} MB</p>
  </div>
</template>

<script>
import si from 'systeminformation';
import sleep from 'es7-sleep';
import cloneDeep from 'clone-deep';

const INTERVAL_DELAY = 1000;
const AVG_LENGTH = 10;

export default {
  data: () => {
    return {
      IS_DEV,
      processList: [],
      interval: true,
      enabled: true,
      avgCpuValues: [],
    };
  },

  computed: {
    filteredProcessList() {
      if (IS_LINUX) {
        return this.processList.filter(l => l.path.toLowerCase().indexOf('electron/dist') > -1);
      } else {
        return this.processList.filter(l => l.name.toLowerCase().indexOf('electron') > -1);
      }
    },

    totalCpuUsage() {
      const cpuSum = this.filteredProcessList.reduce((prev, current) => {
        return prev + current.pcpu;
      }, 0);

      return cpuSum.toFixed(2);
    },

    totalMemUsage() {
      const memSum = this.filteredProcessList.reduce((prev, current) => {
        return prev + current.mem_rss;
      }, 0);

      const b = 1024;

      return (memSum / b).toFixed(2);
    },

    avgCpuUsage() {
      if (this.avgCpuValues.length > 0) {
        return this.avgCpuValues.reduce((a, v, i) => (a * i + v) / (i + 1)).toFixed(2);
      }

      return '–';
    },
  },

  async mounted() {
    if (this.enabled) {
      while (this.interval) {
        let data = await si.processes();

        this.processList = cloneDeep(data.list);

        this.calcAvgCpu();

        data = null;

        await sleep(INTERVAL_DELAY);
      }
    }
  },

  destroyed() {
    this.interval = false;
  },

  methods: {
    calcAvgCpu() {
      this.avgCpuValues.push(parseFloat(this.totalCpuUsage));
      this.avgCpuValues = this.avgCpuValues.splice(-AVG_LENGTH);
    },
  },

};
</script>

<style lang="stylus" scoped>
  .stat
    position absolute
    bottom 0
    left 0
    background #000
    color #50ef39
    padding 2px 6px
    font-size 11px
    font-family monospace
    z-index 1000
</style>
