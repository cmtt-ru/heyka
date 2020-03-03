<template>
    <div></div>
</template>

<script>
export default {
  created() {
    // simulate token checking
    const middle = 0.5;

    if (Math.random() < middle) {
      this.$router.replace('main');
    } else {
      this.$router.replace('login');
    }
  },
};
</script>