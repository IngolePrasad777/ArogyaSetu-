export function countByRole(users = [], role) {
  return users.filter((user) => user.role === role).length;
}

export function recentItems(items = [], count = 5) {
  return [...items].slice(0, count);
}

export function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export function roleLabel(role = '') {
  return role.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function statusTone(enabled) {
  return enabled ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800';
}

export function roleTone(role = '') {
  if (role === 'ADMIN') return 'border-violet-300 bg-violet-50 text-violet-800';
  if (role === 'DOCTOR') return 'border-sky-300 bg-sky-50 text-sky-800';
  if (role === 'PATIENT') return 'border-emerald-300 bg-emerald-50 text-emerald-800';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

export function actionTone(action = '') {
  if (action.includes('EMERGENCY')) return 'border-rose-300 bg-rose-50 text-rose-800';
  if (action.includes('LOGIN')) return 'border-sky-300 bg-sky-50 text-sky-800';
  if (action.includes('APPOINTMENT')) return 'border-amber-300 bg-amber-50 text-amber-800';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}
