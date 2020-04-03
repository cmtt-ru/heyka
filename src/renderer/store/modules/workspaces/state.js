const state = () => {
  return {
    /**
     * List of all available workspace
     */
    workspaces: {

      0: {
        /**
         * Workspace id
         * @type {number}
         */
        id: 0,

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
