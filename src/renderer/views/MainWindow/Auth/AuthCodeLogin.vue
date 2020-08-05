<template>
  <div>
    logining...
  </div>
</template>

<script>

export default {
  mounted() {
    this.login(this.$route.query.hash);
  },
  methods: {
    async login(code) {
      await this.$API.auth.signinByLink(code);

      await this.$store.dispatch('initial');

      await this.$router.replace({
        name: 'workspace',
      });
    },
  },
};
</script>
