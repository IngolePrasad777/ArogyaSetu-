export const symptomChips = ['Chest Pain', 'Dizziness', 'Fever', 'Breathing Issue', 'Headache', 'Cough', 'Rash', 'Stomach Pain'];
export const emergencyChips = ['Chest Pain', 'Breathing Issue', 'Bleeding', 'Unconscious', 'High Fever'];
export const bodyLocations = ['Head', 'Chest', 'Abdomen', 'Back', 'Arm', 'Leg', 'Skin', 'Throat'];

export function riskTone(level) {
  if (['HIGH', 'EMERGENCY'].includes(level)) return 'border-rose-400 bg-rose-50 text-rose-800';
  if (level === 'MEDIUM') return 'border-amber-300 bg-amber-50 text-amber-800';
  return 'border-emerald-300 bg-emerald-50 text-emerald-800';
}

export function latestAppointment(appointments = []) {
  return appointments.find((item) => item.status === 'SCHEDULED') || appointments[0];
}

export function formatShortDate(date) {
  if (!date) return '-';
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? date : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(value);
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
