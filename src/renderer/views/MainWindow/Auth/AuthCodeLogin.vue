<template>
  <div>
    logging in...
  </div>
</template>

<script>

export default {
  mounted() {
    this.login(this.$route.query.hash);
  },
  methods: {

    /**
     * Log in with auth link
     *
     * @param {string} code - auth link
     * @returns {void}
     */
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
