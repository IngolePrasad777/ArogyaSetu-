export const priorityStyles = {
  EMERGENCY: 'border-rose-500 bg-rose-50 text-rose-800',
  HIGH: 'border-orange-400 bg-orange-50 text-orange-800',
  MEDIUM: 'border-amber-300 bg-amber-50 text-amber-800',
  LOW: 'border-emerald-400 bg-emerald-50 text-emerald-800'
};

export function priorityTone(level) {
  return priorityStyles[level] || 'border-slate-200 bg-slate-50 text-slate-700';
}

export function patientName(patient) {
  return patient ? `${patient.firstName || ''} ${patient.lastName || ''}`.trim() : 'Patient';
}

export function calcAge(dob) {
  if (!dob) return '-';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Number.isFinite(age) ? age : '-';
}

export function formatDateTime(date, time) {
  if (!date) return '-';
  const value = new Date(`${date}T${String(time || '00:00:00')}`);
  if (Number.isNaN(value.getTime())) return `${date}${time ? ` ${time}` : ''}`;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function triageCounts(queue = []) {
  return queue.reduce((acc, item) => {
    const level = item.latestSymptom?.triageLevel || 'LOW';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, { HIGH: 0, MEDIUM: 0, LOW: 0, EMERGENCY: 0 });
}
