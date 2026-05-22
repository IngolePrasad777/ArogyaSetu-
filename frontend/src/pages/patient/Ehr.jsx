import { useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import { calcAge } from '../../utils/doctorWorkspace.js';

const tabs = ['Profile', 'Symptoms', 'Reports', 'Consultations', 'Prescriptions', 'Follow-up'];

export default function PatientEhr() {
  const [tab, setTab] = useState('Profile');
  const ehr = useQuery({ queryKey: ['patient-ehr'], queryFn: async () => (await api.get('/patient/ehr')).data });
  const profile = useQuery({ queryKey: ['patient-profile'], queryFn: async () => (await api.get('/patient/profile')).data });

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
      {tab === 'Reports' && <section className="card"><h2 className="section-title flex items-center gap-2"><FileText size={20} /> Reports</h2><p className="mt-4 whitespace-pre-wrap text-slate-700">{ehr.data?.reportsUrl || 'No report uploaded.'}</p><button className="btn-secondary mt-4"><Download size={18} /> Download</button></section>}
      {tab === 'Consultations' && <section className="card"><h2 className="section-title">Consultation History</h2><p className="mt-4 whitespace-pre-wrap text-slate-700">{ehr.data?.consultationHistory || 'No consultations recorded.'}</p></section>}
      {tab === 'Prescriptions' && <section className="card"><h2 className="section-title">Prescriptions</h2><p className="mt-4 whitespace-pre-wrap text-slate-700">{ehr.data?.prescriptionHistory || 'No prescriptions recorded.'}</p></section>}
      {tab === 'Follow-up' && <section className="card"><h2 className="section-title">Follow-up</h2><p className="mt-4 text-slate-700">Follow-up advice and upcoming revisit reminders will appear here after consultation.</p></section>}
    </div>
  );
}
