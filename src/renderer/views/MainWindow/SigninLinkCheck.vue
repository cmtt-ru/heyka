<template>
  <div>пожалуйста, подождите...</div>
</template>

<script>
export default {
  mounted() {
    this.login(this.$route.query.hash);
  },
  methods: {
    async login(link) {
      try {
        const res = await this.$API.auth.signinByLink(link);

        console.log(res);
        this.$router.replace({
          path: '/main-window/workspace',
          query: { hash: this.$route.query.hash },
        });
      } catch (err) {
        console.log(err);
        // TODO: show popup with "sorry, link is not valid!" and redirect to login page
      }
    },
  },
};
</script>