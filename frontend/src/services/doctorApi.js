import { api } from './api.js';

export async function fetchDoctorQueue() {
  const response = await api.get('/doctor/queue');
  return response.data;
}
