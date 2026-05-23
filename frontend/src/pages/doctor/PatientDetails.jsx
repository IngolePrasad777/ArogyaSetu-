import { useQuery } from '@tanstack/react-query';
import { Activity, FileText, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { calcAge, patientName, priorityTone } from '../../utils/doctorWorkspace.js';

const tabs = ['Profile', 'Symptoms', 'EHR', 'Reports', 'History'];

export default function PatientDetails() {
  const { id } = useParams();
  const [tab, setTab] = useState('Profile');

  const patient = useQuery({ queryKey: ['doctor-patient', id], queryFn: async () => (await api.get(`/doctor/patients/${id}`)).data });
  const symptoms = useQuery({ queryKey: ['doctor-patient-symptoms', id], queryFn: async () => (await api.get(`/doctor/patients/${id}/symptoms`)).data });
  const ehr = useQuery({ queryKey: ['doctor-patient-ehr', id], queryFn: async () => (await api.get(`/doctor/patients/${id}/ehr`)).data });
  const consultations = useQuery({ queryKey: ['doctor-patient-consultations', id], queryFn: async () => (await api.get(`/doctor/patients/${id}/consultations`)).data });
  const prescriptions = useQuery({ queryKey: ['doctor-patient-prescriptions', id], queryFn: async () => (await api.get(`/doctor/patients/${id}/prescriptions`)).data });
  const latestSymptom = symptoms.data?.[0] || null;

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-clinic-700">Assigned patient</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">{patient.data ? patientName(patient.data) : 'Loading patient...'}</h2>
            <p className="mt-2 text-sm text-slate-500">Age: {calcAge(patient.data?.dob)} · Gender: {patient.data?.gender || '-'} · Blood Group: {patient.data?.bloodGroup || 'Not set'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`pill border ${priorityTone(latestSymptom?.triageLevel)}`}>Priority: {latestSymptom?.triageLevel || 'LOW'}</span>
            <Link className="btn-primary py-2" to="/doctor/consultation">Start Consultation</Link>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item} type="button" className={`pill ${tab === item ? 'border-clinic-700 bg-clinic-700 text-white' : ''}`} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      {tab === 'Profile' && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <h3 className="section-title flex items-center gap-2"><UserRound size={20} /> Patient Profile</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-semibold text-slate-500">Name</dt><dd className="text-slate-900">{patientName(patient.data)}</dd></div>
              <div><dt className="font-semibold text-slate-500">Phone</dt><dd className="text-slate-900">{patient.data?.phone || '-'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Email</dt><dd className="text-slate-900">{patient.data?.email || '-'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Emergency contact</dt><dd className="text-slate-900">{patient.data?.emergencyContact || '-'}</dd></div>
            </dl>
          </div>
          <div className="card">
            <h3 className="section-title flex items-center gap-2"><Activity size={20} /> AI Triage</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-semibold text-slate-500">Priority</dt><dd className="text-slate-900">{latestSymptom?.triageLevel || '-'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Suggested Doctor</dt><dd className="text-slate-900">{latestSymptom?.recommendedDoctor || '-'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Pain level</dt><dd className="text-slate-900">{latestSymptom?.painLevel ?? '-'}</dd></div>
              <div><dt className="font-semibold text-slate-500">Duration</dt><dd className="text-slate-900">{latestSymptom?.duration || '-'}</dd></div>
            </dl>
          </div>
        </section>
      )}

      {tab === 'Symptoms' && (
        <section className="space-y-3">
          {symptoms.isLoading && <p className="text-sm text-slate-500">Loading symptoms...</p>}
          {!symptoms.isLoading && !symptoms.data?.length && <p className="card text-sm text-slate-500">No symptoms recorded.</p>}
          {symptoms.data?.map((symptom) => (
            <article className={`card border-l-4 ${priorityTone(symptom.triageLevel)}`} key={symptom.symptomId}>
              <p className="font-bold text-slate-950">{symptom.symptoms}</p>
              <p className="mt-2 text-sm text-slate-600">Duration: {symptom.duration || '-'} · Pain: {symptom.painLevel ?? '-'}</p>
              <p className="mt-2 text-sm text-slate-500">Suggested: {symptom.recommendedDoctor || '-'}</p>
              <p className="mt-1 text-xs text-slate-400">{symptom.aiDisclaimer}</p>
            </article>
          ))}
        </section>
      )}

      {tab === 'EHR' && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="card"><h3 className="section-title">Allergies</h3><p className="mt-3 whitespace-pre-wrap text-slate-700">{ehr.data?.allergies || 'None recorded.'}</p></div>
          <div className="card"><h3 className="section-title">Current Medications</h3><p className="mt-3 whitespace-pre-wrap text-slate-700">{ehr.data?.currentMedications || 'None recorded.'}</p></div>
          <div className="card md:col-span-2"><h3 className="section-title">Medical History</h3><p className="mt-3 whitespace-pre-wrap text-slate-700">{ehr.data?.medicalHistory || 'No medical history recorded.'}</p></div>
        </section>
      )}

      {tab === 'Reports' && (
        <section className="card">
          <h3 className="section-title flex items-center gap-2"><FileText size={20} /> Reports</h3>
          {ehr.data?.reportsUrl
            ? ehr.data.reportsUrl.split('\n').filter(Boolean).map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className="mt-3 block truncate text-sm font-semibold text-clinic-700 hover:underline">{url}</a>
              ))
            : <p className="mt-3 text-sm text-slate-500">No reports uploaded yet.</p>}
        </section>
      )}

      {tab === 'History' && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="card">
            <h3 className="section-title">Past Consultations</h3>
            <div className="mt-4 space-y-3">
              {consultations.isLoading && <p className="text-sm text-slate-500">Loading...</p>}
              {consultations.data?.map((item) => (
                <div className="rounded-md bg-slate-50 p-3 text-sm" key={item.consultationId}>
                  <p className="font-semibold text-slate-700">{item.mode}</p>
                  <p className="mt-1 text-slate-600">{item.diagnosis || 'No diagnosis recorded.'}</p>
                  {item.notes && <p className="mt-1 text-slate-500">{item.notes}</p>}
                </div>
              ))}
              {!consultations.isLoading && !consultations.data?.length && <p className="text-sm text-slate-500">No consultations recorded.</p>}
            </div>
          </div>
          <div className="card">
            <h3 className="section-title">Prescriptions</h3>
            <div className="mt-4 space-y-3">
              {prescriptions.isLoading && <p className="text-sm text-slate-500">Loading...</p>}
              {prescriptions.data?.map((item) => (
                <div className="rounded-md bg-slate-50 p-3 text-sm" key={item.prescriptionId}>
                  <p className="font-semibold text-slate-700">Code: {item.verificationCode}</p>
                  <p className="mt-1 whitespace-pre-wrap text-slate-600">{item.medicines}</p>
                  {item.dosageInstructions && <p className="mt-1 text-slate-500">{item.dosageInstructions}</p>}
                  {item.followUpAdvice && <p className="mt-1 text-slate-500">{item.followUpAdvice}</p>}
                </div>
              ))}
              {!prescriptions.isLoading && !prescriptions.data?.length && <p className="text-sm text-slate-500">No prescriptions recorded.</p>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
