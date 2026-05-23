export const symptomChips = ['Chest Pain', 'Dizziness', 'Fever', 'Breathing Issue', 'Headache', 'Cough', 'Rash', 'Stomach Pain'];
export const emergencyChips = ['Chest Pain', 'Breathing Issue', 'Bleeding', 'Unconscious', 'High Fever'];
export const bodyLocations = ['Head', 'Chest', 'Abdomen', 'Back', 'Arm', 'Leg', 'Skin', 'Throat'];
export const sampleReports = [
  { name: 'CBC.pdf', type: 'Blood test', date: '2026-05-20' },
  { name: 'Prescription_1.pdf', type: 'Prescription', date: '2026-05-21' },
  { name: 'XRay.png', type: 'Imaging', date: '2026-05-22' }
];

export function riskTone(level) {
  if (['HIGH', 'EMERGENCY'].includes(level)) return 'border-rose-400 bg-rose-50 text-rose-800';
  if (level === 'MEDIUM') return 'border-amber-300 bg-amber-50 text-amber-800';
  return 'border-emerald-300 bg-emerald-50 text-emerald-800';
}

export function latestAppointment(appointments = []) {
  const scheduled = appointments
    .filter((item) => isActiveAppointment(item))
    .sort((a, b) => appointmentDateTime(a) - appointmentDateTime(b));
  return scheduled[0] || appointments[0];
}

export function formatShortDate(date) {
  if (!date) return '-';
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? date : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(value);
}

export function formatTime(time) {
  if (!time) return '-';
  const [hour = '00', minute = '00'] = String(time).split(':');
  const value = new Date();
  value.setHours(Number(hour), Number(minute), 0, 0);
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(value);
}

export function appointmentDateTime(appointment) {
  if (!appointment?.appointmentDate || !appointment?.appointmentTime) return new Date(0);
  const [hour = '00', minute = '00', second = '00'] = String(appointment.appointmentTime).split(':');
  return new Date(`${appointment.appointmentDate}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`);
}

export function formatCountdown(targetDate) {
  if (!targetDate || Number.isNaN(targetDate.getTime())) return '--';
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

export function patientJoinWindow(appointment) {
  const startsAt = appointmentDateTime(appointment);
  // TODO: restore to: new Date(startsAt.getTime() - 10 * 60000)
  return new Date(startsAt.getTime() - 10 * 60000 * 1000); // effectively always open
}

export function doctorJoinWindow(appointment) {
  const startsAt = appointmentDateTime(appointment);
  // TODO: restore to: opensAt = startsAt - 15min, closesAt = startsAt + 30min
  return {
    opensAt: new Date(0),           // always open
    closesAt: new Date(8640000000000000) // never closes
  };
}

export function patientConsultationWindow(appointment) {
  const startsAt = appointmentDateTime(appointment);
  // TODO: restore to: opensAt = startsAt - 10min, closesAt = startsAt + 30min
  return {
    opensAt: new Date(0),           // always open
    closesAt: new Date(8640000000000000) // never closes
  };
}

export function isAppointmentExpired(appointment) {
  if (!appointment) return false;
  if (appointment.status === 'CANCELLED') return true;
  // TODO: restore expiry check — currently disabled for testing
  // const { closesAt } = doctorJoinWindow(appointment);
  // return Date.now() > closesAt.getTime();
  return false;
}

export function isActiveAppointment(appointment) {
  // TODO: restore to only SCHEDULED/WAITING/READY/IN_PROGRESS — currently includes COMPLETED for testing
  return Boolean(appointment && ['SCHEDULED', 'WAITING', 'READY', 'IN_PROGRESS', 'COMPLETED'].includes(appointment.status) && !isAppointmentExpired(appointment));
}

export function waitingRoomKey(appointmentId) {
  return `arogyasetu-waiting-room:${appointmentId}`;
}

export function readWaitingRoom(appointmentId) {
  if (!appointmentId) return { patientJoined: false, doctorJoined: false };
  try {
    return JSON.parse(localStorage.getItem(waitingRoomKey(appointmentId))) || { patientJoined: false, doctorJoined: false };
  } catch {
    return { patientJoined: false, doctorJoined: false };
  }
}

export function writeWaitingRoom(appointmentId, patch) {
  const next = { ...readWaitingRoom(appointmentId), ...patch, updatedAt: new Date().toISOString() };
  localStorage.setItem(waitingRoomKey(appointmentId), JSON.stringify(next));
  return next;
}

export function consultationStatus(appointment, room = readWaitingRoom(appointment?.appointmentId)) {
  if (!appointment) return 'SCHEDULED';
  if (appointment.status === 'COMPLETED') return 'COMPLETED';
  if (isAppointmentExpired(appointment)) return 'EXPIRED';
  if (appointment.status === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (room.patientJoined && room.doctorJoined) return 'READY';
  if (room.patientJoined) return 'WAITING_ROOM';
  if (room.doctorJoined) return 'DOCTOR_WAITING';
  const { opensAt, closesAt } = patientConsultationWindow(appointment);
  if (Date.now() >= opensAt.getTime() && Date.now() <= closesAt.getTime()) return 'JOIN_AVAILABLE';
  return appointment.status || 'SCHEDULED';
}

export function meetingChannel(appointment) {
  return `arogyasetu-${appointment?.appointmentId || 'consultation'}`;
}

export function meetingPath(role, appointment) {
  const base = role === 'doctor' ? '/doctor/meeting' : '/patient/meeting';
  return `${base}?appointmentId=${appointment.appointmentId}&channel=${encodeURIComponent(meetingChannel(appointment))}`;
}

export function aiExplanation(result, formValues = {}) {
  if (!result) return [];
  const symptoms = String(formValues.symptoms || '').toLowerCase();
  const reasons = [];
  if (symptoms.includes('chest')) reasons.push('Chest Pain');
  if (formValues.emergency) reasons.push('Emergency Flag');
  if (Number(formValues.painLevel) > 5) reasons.push('Pain level > 5');
  if (String(formValues.duration || '').match(/[2-9]|day|week/i)) reasons.push('Duration > 2 days');
  if (!reasons.length) reasons.push('Symptoms pattern', 'Risk category match');
  return reasons;
}

export function possibleRiskFor(department) {
  const value = String(department || '').toLowerCase();
  if (value.includes('pulmon')) return 'Respiratory issue';
  if (value.includes('cardio')) return 'Heart or circulation concern';
  if (value.includes('derm')) return 'Skin or allergy concern';
  if (value.includes('neuro')) return 'Neurological concern';
  if (value.includes('ortho')) return 'Bone or joint concern';
  return 'General health concern';
}

export function recommendationFor(level) {
  if (level === 'EMERGENCY') return 'Seek urgent care immediately and book emergency consultation.';
  if (level === 'HIGH') return 'Book consultation as soon as possible.';
  if (level === 'MEDIUM') return 'Book consultation within 24 hrs.';
  return 'Monitor symptoms and book consultation if symptoms persist.';
}
