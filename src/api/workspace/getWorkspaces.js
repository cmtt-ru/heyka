import axios from 'axios';

export default async function () {
  const res = await axios.get('/workspaces');

  return res.data;
}