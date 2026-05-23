import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, Brain, CalendarPlus, FileUp, Mic, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import { matchesSpecialization } from '../../utils/doctorSlots.js';
import { aiExplanation, bodyLocations, possibleRiskFor, recommendationFor, symptomChips } from '../../utils/patientWorkspace.js';

export default function Symptoms() {
  const [result, setResult] = useState(null);
  const [selectedChips, setSelectedChips] = useState([]);
  const [submittedValues, setSubmittedValues] = useState({});
  const { register, handleSubmit, setValue, watch } = useForm({ defaultValues: { painLevel: 5, bodyLocation: '', emergency: false } });
  const painLevel = watch('painLevel');
  const doctors = useQuery({ queryKey: ['doctors'], queryFn: async () => (await api.get('/doctors')).data });
  const matchedDoctors = result
    ? (doctors.data || []).filter((doctor) => matchesSpecialization(doctor, result.recommendedDoctor)).slice(0, 4)
    : [];
  const mutation = useMutation({ mutationFn: (data) => api.post('/patient/symptoms', data), onSuccess: (r) => setResult(r.data) });
  const toggleChip = (chip) => {
    const next = selectedChips.includes(chip) ? selectedChips.filter((item) => item !== chip) : [...selectedChips, chip];
    setSelectedChips(next);
    setValue('symptoms', next.join(', '));
  };

  return (
    <div>
      <PageHeader title="AI Symptom Checker" eyebrow="Assistive triage">
        Enter symptoms even during low connectivity. AI guidance is assistive only and must be validated by a doctor.
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <form className="card space-y-4" onSubmit={handleSubmit((data) => {
          setSubmittedValues(data);
          mutation.mutate(data);
        })}>
          <h2 className="section-title">Symptom Entry</h2>
          <div className="flex flex-wrap gap-2">
            {symptomChips.map((chip) => (
              <button key={chip} type="button" className={`pill ${selectedChips.includes(chip) ? 'border-clinic-700 bg-clinic-700 text-white' : ''}`} onClick={() => toggleChip(chip)}>
                {chip}
              </button>
            ))}
          </div>
          <textarea className="input min-h-40" placeholder="Describe symptoms, onset, severity, and context" {...register('symptoms', { required: true })} />
          <div>
            <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>Severity</span>
              <span>{painLevel || 0}/10</span>
            </div>
            <input className="mt-3 w-full accent-clinic-700" type="range" min="1" max="10" {...register('painLevel', { valueAsNumber: true })} />
            <div className="mt-1 flex justify-between text-xs text-slate-500"><span>1 Low</span><span>10 High</span></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <select className="input" {...register('bodyLocation')}>
              <option value="">Body location</option>
              {bodyLocations.map((item) => <option key={item}>{item}</option>)}
            </select>
            <input className="input" placeholder="Duration, e.g. 2 days" {...register('duration')} />
          </div>
          <textarea className="input" placeholder="Relevant medical history, allergies, current medicines" {...register('medicalHistory')} />
          <div className="flex flex-wrap gap-2">
            <label className="pill cursor-pointer"><input className="mr-2" type="checkbox" {...register('emergency')} /> Emergency symptoms</label>
            <button className="btn-secondary" type="button"><Mic size={18} /> Voice input</button>
            <button className="btn-secondary" type="button"><FileUp size={18} /> Upload report</button>
          </div>
          <button className="btn-primary"><Brain size={18} /> Run AI triage</button>
        </form>
        <aside className="card">
          <h3 className="section-title">Triage Result</h3>
          {result ? (
            <div className="mt-4 space-y-4 text-sm">
              <div className={`rounded-lg p-4 ${['HIGH', 'EMERGENCY'].includes(result.triageLevel) ? 'bg-rose-50 text-rose-800' : 'bg-clinic-50 text-clinic-800'}`}>
                <p className="flex items-center gap-2 text-3xl font-bold">{['HIGH', 'EMERGENCY'].includes(result.triageLevel) ? <AlertTriangle /> : <Stethoscope />} {result.triageLevel}</p>
              </div>
              <dl className="grid gap-3 text-sm">
                <div className="rounded-md bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Priority</dt><dd className="font-bold text-slate-900">{result.triageLevel}</dd></div>
                <div className="rounded-md bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Suggested Department</dt><dd className="font-bold text-slate-900">{result.recommendedDoctor}</dd></div>
                <div className="rounded-md bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Possible Risk</dt><dd>{possibleRiskFor(result.recommendedDoctor)}</dd></div>
                <div className="rounded-md bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Emergency</dt><dd>{['HIGH', 'EMERGENCY'].includes(result.triageLevel) ? 'YES' : 'NO'}</dd></div>
                <div className="rounded-md bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Recommendation</dt><dd>{recommendationFor(result.triageLevel)}</dd></div>
              </dl>
              <div className="rounded-md border border-slate-200 bg-white p-3">
                <p className="font-semibold text-slate-900">Why {result.triageLevel}?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {aiExplanation(result, submittedValues).map((reason) => (
                    <span className="pill" key={reason}>{reason}</span>
                  ))}
                </div>
              </div>
              <p className="text-slate-500">Doctors below are pulled from the verified doctor directory.</p>
              <div className="space-y-2">
                {matchedDoctors.map((doctor) => (
                  <div className="rounded-md border border-slate-200 p-3" key={doctor.doctorId}>
                    <p className="font-bold text-slate-900">{doctor.fullName}</p>
                    <p className="text-slate-600">{doctor.specialization} · {doctor.experience} years</p>
                    <p className="text-slate-500">{doctor.availability}</p>
                  </div>
                ))}
                {!matchedDoctors.length && <p className="rounded-md bg-slate-50 p-3 text-slate-500">No exact specialist match yet. Try General Medicine or emergency booking.</p>}
              </div>
              <Link className="btn-primary w-full" to={`/patient/appointments?specialization=${encodeURIComponent(result.recommendedDoctor)}`}>
                <CalendarPlus size={18} /> Book recommended doctor
              </Link>
              <p className="leading-6 text-slate-500">{result.aiDisclaimer}</p>
            </div>
          ) : <p className="mt-4 text-sm leading-6 text-slate-500">Submit symptoms to see urgency level, department routing, and emergency guidance.</p>}
        </aside>
      </div>
    </div>
  );
}
