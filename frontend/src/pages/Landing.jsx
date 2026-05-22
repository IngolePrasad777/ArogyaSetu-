import { Activity, ArrowRight, CalendarCheck, FileText, Languages, ShieldCheck, Stethoscope, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/rural-telehealth-hero.png';
import LanguageSwitch from '../components/LanguageSwitch.jsx';

const modules = [
  ['AI triage', 'Symptom urgency, doctor recommendation, emergency alerts.', Activity],
  ['Teleconsultation', 'Video first with audio, chat, and async fallback.', Stethoscope],
  ['EHR records', 'Reports, prescriptions, consultations, allergies, and medication history.', FileText],
  ['Offline-first', 'IndexedDB queue keeps rural workflows moving during low connectivity.', WifiOff]
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="relative min-h-[92vh] overflow-hidden">
        <img src={heroImage} alt="Rural telehealth consultation" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/5" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
          <Link to="/" className="text-2xl font-bold text-white">ArogyaSetu+</Link>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-md bg-white/90 px-3 py-2 sm:block"><LanguageSwitch /></div>
            <Link to="/login" className="btn-secondary min-h-10 border-white/40 bg-white/90 py-2">Login</Link>
          </div>
        </header>
        <div className="relative z-10 mx-auto flex min-h-[calc(92vh-88px)] max-w-7xl items-center px-4 pb-16">
          <div className="max-w-2xl text-white">
            <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">AI-enabled telehealth for rural care access</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">ArogyaSetu+</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">
              Connect rural patients with verified doctors, AI-assisted symptom triage, secure EHR records, emergency escalation, and offline-ready workflows.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary bg-white text-clinic-700 hover:bg-clinic-50">Create account <ArrowRight size={18} /></Link>
              <Link to="/login" className="btn-secondary border-white/35 bg-white/10 text-white hover:bg-white/20">Open dashboard</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-10 relative z-10 mx-auto grid max-w-7xl gap-4 px-4 pb-10 md:grid-cols-4">
        {modules.map(([title, copy, Icon]) => (
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={title}>
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-clinic-50 text-clinic-700"><Icon size={22} /></span>
            <h2 className="mt-4 section-title">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
          </article>
        ))}
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-12">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          <div className="card">
            <ShieldCheck className="text-clinic-700" />
            <h3 className="mt-3 section-title">Verified Care Network</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Admin verification, RBAC, consent tracking, audit logs, and assigned-patient access keep records controlled.</p>
          </div>
          <div className="card">
            <CalendarCheck className="text-clinic-700" />
            <h3 className="mt-3 section-title">Emergency Ready</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">High-risk symptoms trigger alerts and can route patients to fast consultation booking with fallback doctor selection.</p>
          </div>
          <div className="card">
            <Languages className="text-clinic-700" />
            <h3 className="mt-3 section-title">Rural Friendly UI</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Large controls, clear labels, and English, Hindi, Marathi language selection support varied users and low-literacy contexts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
