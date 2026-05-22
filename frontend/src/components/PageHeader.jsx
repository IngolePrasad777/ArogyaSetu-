export default function PageHeader({ title, eyebrow, action, children }) {
  return (
    <div className="mb-5 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-wider text-clinic-700">{eyebrow}</p>}
        <h1 className="page-title mt-1">{title}</h1>
        {children && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{children}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
