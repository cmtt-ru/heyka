/**
 * @typedef {object} Workspace
 * @property {string} id – workspace id
 * @property {string} name – workspace name
 * @property {string} avatar – leonardo url
 * @property {string} createdAt – workspace creation date
 * @property {string} updatedAt – workspace update date
 */

/**
 * @typedef {Object.<string, Workspace>} WorkspaceCollection
 */

/**
 * Workspace state
 * @returns {WorkspaceState}
 */
const state = () => {
  /**
   * @namespace WorkspaceState
   */
  return {
    /**
     * @type WorkspaceCollection
     */
    collection: {},
  };
};

export default state();
