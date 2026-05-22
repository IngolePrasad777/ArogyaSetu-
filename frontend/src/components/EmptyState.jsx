export default function EmptyState({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      <p className="font-semibold text-slate-700">{title}</p>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
