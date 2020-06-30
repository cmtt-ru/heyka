<template>
  <div class="stat">
    <p>CPU: {{ totalCpuUsage }}%</p>
    <p>MEM: {{ totalMemUsage }} MB</p>
  </div>
</template>

<script>
import si from 'systeminformation';
import sleep from 'es7-sleep';

const INTERVAL_DELAY = 1000;

export default {
  data: () => {
    return {
      processList: [],
      interval: true,
      enabled: true,
    };
  },

  computed: {
    filteredProcessList() {
      const processLabel = IS_LINUX ? 'electron/dist' : 'electron';

      return this.processList.filter(l => l.path.toLowerCase().indexOf(processLabel) > -1);
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
  },

  async mounted() {
    if (this.enabled) {
      while (this.interval) {
        const data = await si.processes();

        this.processList = data.list;
        await sleep(INTERVAL_DELAY);
      }
    }
  },

  destroyed() {
    this.interval = false;
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
