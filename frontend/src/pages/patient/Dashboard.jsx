import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, CalendarDays, Check, FileCheck2, FileText, RefreshCw, Stethoscope, TimerReset, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { api } from '../../services/api.js';
import { BLOOD_GROUPS } from '../../utils/doctorSlots.js';
import { formatShortDate, latestAppointment, riskTone } from '../../utils/patientWorkspace.js';

export default function PatientDashboard() {
  const qc = useQueryClient();
  const [bloodGroup, setBloodGroup] = useState('');
  const [saved, setSaved] = useState(false);
  const [dismissedProfilePrompt, setDismissedProfilePrompt] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const profile = useQuery({ queryKey: ['patient-profile'], queryFn: async () => (await api.get('/patient/profile')).data });
  const appts = useQuery({ queryKey: ['appointments'], queryFn: async () => (await api.get('/appointments/history')).data });
  const ehr = useQuery({ queryKey: ['patient-ehr'], queryFn: async () => (await api.get('/patient/ehr')).data, retry: false });
  const nextAppointment = latestAppointment(appts.data || []);
  const aiLevel = nextAppointment?.status === 'SCHEDULED' ? 'MEDIUM' : 'LOW';
  const activePrescription = ehr.data?.prescriptionHistory ? 'Active' : 'None';
  const followUpDue = nextAppointment?.appointmentDate || null;
  const updateProfile = useMutation({
    mutationFn: (data) => api.put('/patient/profile', data),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ['patient-profile'] });
      setTimeout(() => setSaved(false), 2200);
    }
  });

  useEffect(() => {
    if (!profile.data) return;
    if (profile.data.bloodGroup) setBloodGroup(profile.data.bloodGroup);
    reset({
      firstName: profile.data.firstName || '',
      lastName: profile.data.lastName || '',
      phone: profile.data.phone || '',
      gender: profile.data.gender || '',
      dob: profile.data.dob || '',
      bloodGroup: profile.data.bloodGroup || '',
      address: profile.data.address || '',
      emergencyContact: profile.data.emergencyContact || ''
    });
  }, [profile.data, reset]);

  const profileIncomplete = Boolean(profile.data) && ['phone', 'gender', 'dob', 'bloodGroup', 'address', 'emergencyContact']
    .some((field) => !profile.data?.[field]);
  const showProfilePrompt = profileIncomplete && !dismissedProfilePrompt;

  const saveBloodGroup = () => {
    if (!profile.data || !bloodGroup) return;
    updateProfile.mutate({
      firstName: profile.data.firstName,
      lastName: profile.data.lastName,
      phone: profile.data.phone,
      gender: profile.data.gender,
      dob: profile.data.dob,
      bloodGroup,
      address: profile.data.address,
      emergencyContact: profile.data.emergencyContact
    });
  };

  const saveProfile = (data) => {
    updateProfile.mutate(data, { onSuccess: () => setDismissedProfilePrompt(true) });
  };

  return (
    <div>
      {showProfilePrompt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4 py-6">
          <form className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-5 shadow-xl" onSubmit={handleSubmit(saveProfile)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Complete your health profile</h2>
                <p className="mt-1 text-sm text-slate-500">This helps doctors see age, gender, blood group, contact details, and emergency context during consultation.</p>
              </div>
              <button className="btn-secondary min-h-10 px-3 py-2" type="button" onClick={() => setDismissedProfilePrompt(true)} aria-label="Close profile prompt">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label><span className="text-sm font-semibold text-slate-600">First name</span><input className="input mt-2" {...register('firstName', { required: true })} /></label>
              <label><span className="text-sm font-semibold text-slate-600">Last name</span><input className="input mt-2" {...register('lastName', { required: true })} /></label>
              <label><span className="text-sm font-semibold text-slate-600">Phone</span><input className="input mt-2" {...register('phone')} /></label>
              <label><span className="text-sm font-semibold text-slate-600">Gender</span><select className="input mt-2" {...register('gender')}><option value="">Select gender</option><option>MALE</option><option>FEMALE</option><option>OTHER</option></select></label>
              <label><span className="text-sm font-semibold text-slate-600">Date of birth</span><input className="input mt-2" type="date" {...register('dob')} /></label>
              <label><span className="text-sm font-semibold text-slate-600">Blood group</span><select className="input mt-2" {...register('bloodGroup')}><option value="">Select blood group</option>{BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}</select></label>
              <label className="md:col-span-2"><span className="text-sm font-semibold text-slate-600">Address</span><textarea className="input mt-2 min-h-24" {...register('address')} /></label>
              <label className="md:col-span-2"><span className="text-sm font-semibold text-slate-600">Emergency contact</span><input className="input mt-2" {...register('emergencyContact')} /></label>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" type="button" onClick={() => setDismissedProfilePrompt(true)}>Later</button>
              <button className="btn-primary" disabled={updateProfile.isPending}>Save profile</button>
            </div>
          </form>
        </div>
      )}
      <PageHeader title="Patient Dashboard" eyebrow="Rural care access" action={<Link to="/patient/symptoms" className="btn-primary">Start triage</Link>}>
        Manage symptoms, appointments, EHR records, prescriptions, and emergency care from one simple workspace.
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={CalendarDays} label="Upcoming Appointment" value={nextAppointment ? formatShortDate(nextAppointment.appointmentDate) : 'None'} />
        <div className={`card min-h-32 border ${riskTone(aiLevel)}`}>
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-semibold">AI Risk Level</p>
            <Activity size={18} />
          </div>
          <p className="mt-4 text-3xl font-bold">AI Priority: {aiLevel}</p>
        </div>
        <StatCard icon={FileCheck2} tone="blue" label="Active Prescription" value={activePrescription} />
        <StatCard icon={TimerReset} tone="amber" label="Follow-up Due" value={followUpDue ? formatShortDate(followUpDue) : 'Not set'} />
        <StatCard icon={Stethoscope} label="EHR Status" value={ehr.data ? 'Available' : 'Missing'} />
        <StatCard icon={RefreshCw} tone="blue" label="Offline Sync" value={navigator.onLine ? 'Synced' : 'Offline Saved'} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_.8fr]">
        <section className="card">
          <h2 className="section-title">Next Step</h2>
          <div className="mt-4 rounded-lg bg-clinic-50 p-4">
            <p className="font-semibold text-clinic-700">{nextAppointment ? `${nextAppointment.doctorName} on ${nextAppointment.appointmentDate}` : 'No scheduled appointment'}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {nextAppointment ? `Mode: ${nextAppointment.consultationMode}. Keep reports ready before the consultation.` : 'Run AI triage or book a consultation with an available doctor.'}
            </p>
          </div>
        </section>
        <section className="card space-y-4">
          <h2 className="section-title">Health Basics</h2>
          <div>
            <label className="text-sm font-semibold text-slate-600">Blood group</label>
            <div className="mt-2 flex gap-2">
              <select className="input" value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)}>
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
              </select>
              <button className="btn-secondary min-w-24" type="button" onClick={saveBloodGroup} disabled={!bloodGroup || updateProfile.isPending}>
                <Check size={18} /> Save
              </button>
            </div>
            {saved && <p className="mt-2 text-sm font-semibold text-clinic-700">Saved to patient profile.</p>}
          </div>
          <div className="rounded-md border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-500">EHR status</p>
            <p className="mt-1 font-semibold text-slate-900">{ehr.isError ? 'No EHR found yet' : ehr.data ? 'Record available' : 'Checking record...'}</p>
          </div>
          <Link to="/patient/ehr" className="flex items-center justify-between rounded-md border border-slate-200 p-4 font-semibold text-slate-700 hover:bg-slate-50">
            Open EHR <FileText size={18} />
          </Link>
        </section>
      </div>
    </div>
  );
}
