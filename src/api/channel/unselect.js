import axios from 'axios';
import { client } from '@api/socket/client';

export default function (id) {
  return axios.post(`/channels/${id}/unselect?socketId=${client.id}`);
}
