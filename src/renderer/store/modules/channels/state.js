const state = () => {
  return {
    /**
     * List of all available channels in specific workspace
     */
    collection: {

      0: {
        /**
         * Channel id
         * @type {string}
         */
        id: '',

        /**
         * Channel name
         * @type {string}
         */
        name: 'test',

        /**
         * Channel description
         * @type {string}
         */
        description: '',

        /**
         * Channel private status
         * @type {boolean}
         */
        isPrivate: true,

        /**
         * Channel creation date
         * @type {string}
         */
        createdAt: '',

        /**
         * Channel update date
         * @type {string}
         */
        updatedAt: '',
      },

    },
  };
};

export default state();
