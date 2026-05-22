export default function StatCard({ label, value, tone = 'clinic', icon: Icon }) {
  const tones = {
    clinic: 'bg-clinic-50 text-clinic-700',
    blue: 'bg-sky-50 text-sky-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700'
  };
  return (
    <div className="card min-h-32">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        {Icon && <span className={`rounded-md p-2 ${tones[tone] || tones.clinic}`}><Icon size={18} /></span>}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-950">{value ?? '-'}</p>
    </div>
  );
}
