import { useQuery } from '@tanstack/react-query';
import { Download, Eye, FileText, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import { calcAge } from '../../utils/doctorWorkspace.js';
import { sampleReports } from '../../utils/patientWorkspace.js';

const tabs = ['Profile', 'Symptoms', 'Reports', 'Consultations', 'Prescriptions', 'Follow-up'];

export default function PatientEhr() {
  const [tab, setTab] = useState('Profile');

  // staleTime: 0 ensures data is always fresh when the patient navigates here
  const ehr = useQuery({
    queryKey: ['patient-ehr'],
    queryFn: async () => (await api.get('/patient/ehr')).data,
    staleTime: 0
  });
  const profile = useQuery({
    queryKey: ['patient-profile'],
    queryFn: async () => (await api.get('/patient/profile')).data,
    staleTime: 0
  });

  // Fetch prescriptions directly from the prescriptions list via EHR download
  // The backend stores them in EHR prescriptionHistory as text — we parse that
  // but also show a refetch button so the patient can pull latest data
  const prescriptionBlocks = (ehr.data?.prescriptionHistory || '')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div>
      <PageHeader title="Electronic Health Record" eyebrow="Patient-owned history">
        Profile, symptoms, reports, consultations, prescriptions, and follow-up context in one place.
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item}
              className={`pill ${tab === item ? 'border-clinic-700 bg-clinic-700 text-white' : ''}`}
              type="button"
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          className="btn-secondary py-1.5 text-xs"
          type="button"
          onClick={() => { ehr.refetch(); profile.refetch(); }}
          disabled={ehr.isFetching}
        >
          <RefreshCw size={14} className={ehr.isFetching ? 'animate-spin' : ''} />
          {ehr.isFetching ? 'Refreshing...' : 'Refresh EHR'}
        </button>
      </div>

      {tab === 'Profile' && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <h2 className="section-title">Patient Profile</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-semibold text-slate-500">Blood group</dt><dd>{profile.data?.bloodGroup || 'Not set'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Age</dt><dd>{calcAge(profile.data?.dob)}</dd></div>
              <div><dt className="font-semibold text-slate-500">Emergency contact</dt><dd>{profile.data?.emergencyContact || '-'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Allergies</dt><dd>{ehr.data?.allergies || 'None recorded.'}</dd></div>
            </dl>
          </div>
          <div className="card">
            <h2 className="section-title">Medical History</h2>
            <p className="mt-4 whitespace-pre-wrap text-slate-700">{ehr.data?.medicalHistory || 'No medical history recorded.'}</p>
          </div>
        </section>
      )}

      {tab === 'Symptoms' && (
        <section className="card">
          <h2 className="section-title">Symptoms &amp; Triage History</h2>
          <p className="mt-4 whitespace-pre-wrap text-slate-700">
            {ehr.data?.consultationHistory || 'Symptoms from triage will appear here after consultations.'}
          </p>
        </section>
      )}

      {tab === 'Reports' && (
        <section className="card">
          <h2 className="section-title flex items-center gap-2"><FileText size={20} /> Reports Viewer</h2>
          {/* Uploaded S3 reports */}
          {ehr.data?.reportsUrl && ehr.data.reportsUrl.trim() ? (
            <div className="mt-4 grid gap-3">
              {ehr.data.reportsUrl.split('\n').filter(Boolean).map((url) => (
                <div key={url} className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="truncate text-sm font-semibold text-slate-900">{url.split('/').pop()}</p>
                  <div className="flex gap-2">
                    <a className="btn-secondary" href={url} target="_blank" rel="noreferrer"><Eye size={18} /> View</a>
                    <a className="btn-secondary" href={url} download><Download size={18} /> Download</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="mt-3 text-sm text-slate-500">No reports uploaded yet. Sample reports shown below.</p>
              <div className="mt-4 grid gap-3">
                {sampleReports.map((report) => (
                  <div key={report.name} className="flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
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
            </>
          )}
        </section>
      )}

      {tab === 'Consultations' && (
        <section className="card">
          <h2 className="section-title">Consultation History</h2>
          {ehr.data?.consultationHistory ? (
            <div className="mt-4 space-y-3">
              {ehr.data.consultationHistory.split('\n\n').filter(Boolean).map((entry, i) => (
                <div key={i} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{entry}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-slate-500">No consultations recorded yet.</p>
          )}
        </section>
      )}

      {tab === 'Prescriptions' && (
        <section className="card">
          <h2 className="section-title">Prescriptions</h2>
          {ehr.isFetching && <p className="mt-3 text-sm text-slate-500">Loading latest prescriptions...</p>}
          {!ehr.isFetching && !prescriptionBlocks.length && (
            <p className="mt-4 text-slate-500">No prescriptions recorded yet. After a doctor saves a prescription it will appear here.</p>
          )}
          <div className="mt-4 grid gap-3">
            {prescriptionBlocks.map((block, index) => (
              <article key={`${index}-${block.slice(0, 20)}`} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-slate-950">Prescription {prescriptionBlocks.length - index}</p>
                    <p className="text-sm text-slate-500">Saved to EHR by doctor</p>
                  </div>
                  <span className="pill border-emerald-300 bg-emerald-50 text-emerald-800">Active</span>
                </div>
                <pre className="mt-4 whitespace-pre-wrap rounded-md bg-white p-3 text-sm leading-6 text-slate-700">{block}</pre>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'Follow-up' && (
        <section className="card">
          <h2 className="section-title">Follow-up</h2>
          <p className="mt-4 text-slate-700">
            {ehr.data?.prescriptionHistory
              ? 'Follow-up advice is included in your latest prescription above.'
              : 'Follow-up advice and upcoming revisit reminders will appear here after consultation.'}
          </p>
        </section>
      )}

      <section className="card mt-4">
        <h2 className="section-title">Care Timeline</h2>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-4">
          {['Symptoms', 'Consultation', 'Prescription', 'Follow-up'].map((step) => (
            <div key={step} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-center font-semibold text-slate-700">{step}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
