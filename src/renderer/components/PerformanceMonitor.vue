<template>
  <div class="stat">
    <p>CPU: {{ totalCpuUsage }}%</p>
    <p>MEM: {{ totalMemUsage }} MB</p>
  </div>
</template>

<script>
import si from 'systeminformation';

export default {
  data: () => {
    return {
      processList: [],
      interval: null,
      enabled: true,
    };
  },

  computed: {
    filteredProcessList() {
      // console.log(this.processList);
      if (IS_LINUX) {
        return this.processList.filter(l => l.path.toLowerCase().indexOf('electron/dist') > -1);
      } else {
        return this.processList.filter(l => l.path.toLowerCase().indexOf('electron') > -1);
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
  },

  mounted() {
    if (this.enabled) {
      this.interval = setInterval(async () => {
        const data = await si.processes();

        this.processList = data.list;
      }, parseInt('1000'));
    }
  },

  destroyed() {
    clearInterval(this.interval);
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
