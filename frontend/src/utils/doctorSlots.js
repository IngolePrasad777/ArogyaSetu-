export const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiologist',
  'Pulmonologist',
  'Dermatologist',
  'Pediatrics',
  'Orthopedics',
  'Gynecology',
  'Neurologist',
  'Psychiatrist',
  'ENT Specialist'
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function normalizeSlot(slot) {
  if (!slot) return '';
  const match = String(slot).match(/\b([01]\d|2[0-3]):([0-5]\d)/);
  return match ? `${match[1]}:${match[2]}` : '';
}

export function displaySlot(slot) {
  return normalizeSlot(slot) || slot;
}

export function parseAvailabilitySlots(availability) {
  const matches = String(availability || '').match(/\b(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?\b/g) || [];
  return [...new Set(matches.map(normalizeSlot).filter(Boolean))];
}

export function availableDoctorSlots(doctor, backendSlots = []) {
  const availabilitySlots = parseAvailabilitySlots(doctor?.availability);
  const openSlots = backendSlots.map(normalizeSlot).filter(Boolean);
  if (!availabilitySlots.length) return openSlots;
  if (!openSlots.length) return availabilitySlots;
  return availabilitySlots.filter((slot) => openSlots.includes(slot));
}

export function matchesSpecialization(doctor, specialization) {
  const target = String(specialization || '').trim().toLowerCase();
  if (!target) return true;
  const doctorSpecialization = String(doctor?.specialization || '').toLowerCase();
  return doctorSpecialization.includes(target) || target.includes(doctorSpecialization);
}
