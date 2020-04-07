const state = () => {
  return {
    /**
     * List of all available users in specific workspace
     */
    collection: {

      0: {
        /**
         * User id
         * @type {string}
         */
        id: '',

        /**
         * User name
         * @type {string}
         */
        name: 'test',

        /**
         * User email
         * @type {string}
         */
        email: 'email@test.io',

        /**
         * Email verification status
         * @type {boolean}
         */
        isEmailVerified: true,

        /**
         * User avatar
         * Represents as leonardo url
         * @type {string}
         */
        avatar: 'leonardo-image-src',

        /**
         * User creation date
         * @type {string}
         */
        createdAt: '',

        /**
         * User update date
         * @type {string}
         */
        updatedAt: '',

        /**
         * Online status
         * @type {string}
         */
        onlineStatus: 'online',

      },

    },
  };
};

export default state();
