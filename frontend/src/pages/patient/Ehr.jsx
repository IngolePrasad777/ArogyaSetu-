import { useQuery } from '@tanstack/react-query';
import { Download, Eye, FileText } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import { calcAge } from '../../utils/doctorWorkspace.js';
import { sampleReports } from '../../utils/patientWorkspace.js';

const tabs = ['Profile', 'Symptoms', 'Reports', 'Consultations', 'Prescriptions', 'Follow-up'];

function prescriptionBlocks(history = '') {
  return String(history || '')
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function PatientEhr() {
  const [tab, setTab] = useState('Profile');
  const ehr = useQuery({ queryKey: ['patient-ehr'], queryFn: async () => (await api.get('/patient/ehr')).data });
  const profile = useQuery({ queryKey: ['patient-profile'], queryFn: async () => (await api.get('/patient/profile')).data });
  const prescriptions = prescriptionBlocks(ehr.data?.prescriptionHistory);

  return (
    <div>
      <PageHeader title="Electronic Health Record" eyebrow="Patient-owned history">
        Profile, symptoms, reports, consultations, prescriptions, and follow-up context in one place.
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((item) => <button key={item} className={`pill ${tab === item ? 'border-clinic-700 bg-clinic-700 text-white' : ''}`} type="button" onClick={() => setTab(item)}>{item}</button>)}
      </div>
      {tab === 'Profile' && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card"><h2 className="section-title">Patient Profile</h2><dl className="mt-4 space-y-3 text-sm">
            <div><dt className="font-semibold text-slate-500">Blood group</dt><dd>{profile.data?.bloodGroup || 'Not set'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Age</dt><dd>{calcAge(profile.data?.dob)}</dd></div>
            <div><dt className="font-semibold text-slate-500">Emergency contact</dt><dd>{profile.data?.emergencyContact || '-'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Allergies</dt><dd>{ehr.data?.allergies || 'None recorded.'}</dd></div>
          </dl></div>
          <div className="card"><h2 className="section-title">Medical History</h2><p className="mt-4 whitespace-pre-wrap text-slate-700">{ehr.data?.medicalHistory || 'No medical history recorded.'}</p></div>
        </section>
      )}
      {tab === 'Symptoms' && <section className="card"><h2 className="section-title">Symptoms</h2><p className="mt-4 whitespace-pre-wrap text-slate-700">{ehr.data?.consultationHistory || 'Symptoms from triage will appear here after consultations.'}</p></section>}
      {tab === 'Reports' && (
        <section className="card">
          <h2 className="section-title flex items-center gap-2"><FileText size={20} /> Reports Viewer</h2>
          <div className="mt-4 grid gap-3">
            {sampleReports.map((report) => (
              <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between" key={report.name}>
                <div>
                  <p className="font-bold text-slate-950">{report.name}</p>
                  <p className="text-sm text-slate-500">{report.type} · {report.date}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary" type="button"><Eye size={18} /> View</button>
                  <button className="btn-secondary" type="button"><Download size={18} /> Download</button>
                </div>
              </div>
            ))}
          </div>
          {ehr.data?.reportsUrl && <p className="mt-4 whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-slate-700">{ehr.data.reportsUrl}</p>}
        </section>
      )}
      {tab === 'Consultations' && <section className="card"><h2 className="section-title">Consultation History</h2><p className="mt-4 whitespace-pre-wrap text-slate-700">{ehr.data?.consultationHistory || 'No consultations recorded.'}</p></section>}
      {tab === 'Prescriptions' && (
        <section className="card">
          <h2 className="section-title">Prescriptions</h2>
          {!prescriptions.length && <p className="mt-4 text-slate-700">No prescriptions recorded.</p>}
          <div className="mt-4 grid gap-3">
            {prescriptions.map((prescription, index) => (
              <article className="rounded-md border border-slate-200 bg-slate-50 p-4" key={`${index}-${prescription.slice(0, 20)}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">Prescription {prescriptions.length - index}</p>
                    <p className="text-sm text-slate-500">Saved to patient EHR after doctor consultation</p>
                  </div>
                  <span className="pill">Active</span>
                </div>
                <pre className="mt-4 whitespace-pre-wrap rounded-md bg-white p-3 text-sm leading-6 text-slate-700">{prescription}</pre>
              </article>
            ))}
          </div>
        </section>
      )}
      {tab === 'Follow-up' && <section className="card"><h2 className="section-title">Follow-up</h2><p className="mt-4 text-slate-700">Follow-up advice and upcoming revisit reminders will appear here after consultation.</p></section>}
      <section className="card mt-4">
        <h2 className="section-title">Care Timeline</h2>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
          {['Symptoms', 'Consultation', 'Prescription', 'Follow-up'].map((step) => (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-center font-semibold text-slate-700" key={step}>{step}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
