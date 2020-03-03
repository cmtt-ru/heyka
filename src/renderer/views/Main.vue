<template>
    <div>
        <div>Main window</div>
        <svg-icon name="headphones"></svg-icon>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  mounted() {
    ipcRenderer.send('StartChannel', 'Hello from Main!');
  },
};
</script>
