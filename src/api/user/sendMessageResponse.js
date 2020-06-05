import axios from 'axios';

export default async function (params) {
  const res = await axios.post(`/message-response`, params);

  return res.data;
}