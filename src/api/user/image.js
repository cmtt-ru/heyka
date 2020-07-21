import axios from 'axios';

/**
 * Upload an image (jpg, jpeg, png) (Accept multipart uploading, file field name must be "image")
 * @param {object} params - params
 * @param {string} params.image - image in base64
 *
 * @returns {object} result data
 */
export default async function (params) {
  const res = await axios.post(`/image`, params);

  return res.data;
}
