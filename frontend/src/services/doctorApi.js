import { api } from './api.js';

export async function fetchDoctorQueue() {
  const appointments = (await api.get('/doctor/appointments')).data;
  return Promise.all(appointments.map(async (appointment) => {
    const patient = await api.get(`/doctor/patients/${appointment.patientId}`)
      .then((response) => response.data)
      .catch(() => ({ patientId: appointment.patientId, firstName: 'Assigned', lastName: 'Patient' }));
    return { appointment, patient, latestSymptom: null };
  }));
}
