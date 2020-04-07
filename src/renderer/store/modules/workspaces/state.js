const state = () => {
  return {
    /**
     * List of all available workspaces
     */
    collection: {

      0: {
        /**
         * Workspace id
         * @type {string}
         */
        id: '',

        /**
         * Workspace name
         * @type {string}
         */
        name: 'test',

        /**
         * Workspace avatar
         * Represents as leonardo url
         * @type {string}
         */
        avatar: 'leonardo-image-src',

        /**
         * Workspace creation date
         * @type {string}
         */
        createdAt: '',

        /**
         * Workspace update date
         * @type {string}
         */
        updatedAt: '',
      },

    },
  };
};

export default state();
