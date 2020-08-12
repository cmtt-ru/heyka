import axios from 'axios';

/**
 * Call the method, redirect user with the provided url and call method encore with result of social authorization.
 * ! work in progress
 *
 * @param {string} social - facebook/google/slack
 * @param {object} params - params
 *
 * @returns {object} result data
 */
export default function (social, params) {
  return axios.get(`/signin/${social}`, params).then(res => res.data);
}