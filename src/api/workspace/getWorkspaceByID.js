import axios from 'axios';

export default async function (id) {
  const res = await axios.get(`/workspaces/${id}`);

  return res.data;
}
