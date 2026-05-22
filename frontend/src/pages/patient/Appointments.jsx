import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, PhoneCall, Search, ShieldAlert, Stethoscope, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import { availableDoctorSlots, displaySlot, matchesSpecialization, SPECIALIZATIONS } from '../../utils/doctorSlots.js';
import { emergencyChips } from '../../utils/patientWorkspace.js';

export default function PatientAppointments() {
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues: { consultationMode: 'VIDEO', emergencySymptoms: '' } });
  const [specialization, setSpecialization] = useState(params.get('specialization') || 'General Medicine');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const history = useQuery({ queryKey: ['appointments'], queryFn: async () => (await api.get('/appointments/history')).data });
  const doctors = useQuery({ queryKey: ['doctors'], queryFn: async () => (await api.get('/doctors')).data });
  const filteredDoctors = useMemo(() => (doctors.data || []).filter((doctor) => matchesSpecialization(doctor, specialization)), [doctors.data, specialization]);
  const selectedDoctor = filteredDoctors.find((doctor) => doctor.doctorId === selectedDoctorId) || filteredDoctors[0];
  const slots = useQuery({
    queryKey: ['slots', selectedDoctor?.doctorId, selectedDate],
    enabled: Boolean(selectedDoctor?.doctorId),
    queryFn: async () => (await api.get(`/doctors/${selectedDoctor.doctorId}/slots`, { params: { date: selectedDate } })).data
  });
  const slotChoices = availableDoctorSlots(selectedDoctor, slots.data?.[0]?.slots || []);
  const book = useMutation({
    mutationFn: (data) => api.post('/appointments/book', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
      setSelectedSlot('');
    }
  });
  const emergency = useMutation({ mutationFn: (data) => api.post('/appointments/emergency', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }) });

  useEffect(() => {
    setSelectedDoctorId(filteredDoctors[0]?.doctorId || '');
    setSelectedSlot('');
  }, [filteredDoctors[0]?.doctorId, specialization]);

  const bookSelectedSlot = (data) => {
    if (!selectedDoctor?.doctorId || !selectedSlot) return;
    book.mutate({
      doctorId: selectedDoctor.doctorId,
      appointmentDate: selectedDate,
      appointmentTime: selectedSlot,
      consultationMode: data.consultationMode
    });
  };

  const requestEmergency = (data) => {
    emergency.mutate({
      symptoms: data.emergencySymptoms || 'Emergency appointment requested by patient',
      preferredSpecialization: specialization,
      consultationMode: data.consultationMode
    });
  };

  return (
    <div>
      <PageHeader title="Appointments" eyebrow="Scheduling and fallback care">
        Choose a specialist, pick an open slot, and book without copying technical IDs.
      </PageHeader>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <form className="space-y-4" onSubmit={handleSubmit(bookSelectedSlot)}>
        <section className="card space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <label className="flex-1">
              <span className="text-sm font-semibold text-slate-600">Specialization</span>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} />
                <input className="input pl-10" placeholder="Search specialization" value={specialization} onChange={(event) => setSpecialization(event.target.value)} />
              </div>
            </label>
            <label className="md:w-56">
              <span className="text-sm font-semibold text-slate-600">Date</span>
              <input className="input mt-2" type="date" value={selectedDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setSelectedDate(event.target.value)} />
            </label>
            <label className="md:w-44">
              <span className="text-sm font-semibold text-slate-600">Mode</span>
              <select className="input mt-2" {...register('consultationMode')}><option>VIDEO</option><option>AUDIO</option><option>CHAT</option><option>ASYNC</option></select>
            </label>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Selected:</span> {watch('consultationMode')}</p>
            <p className="mt-1"><span className="font-semibold text-slate-900">Fallback:</span> Audio -> Chat -> Async</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((item) => (
              <button className={`pill ${specialization === item ? 'border-clinic-500 bg-clinic-50 text-clinic-700' : ''}`} type="button" key={item} onClick={() => setSpecialization(item)}>
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {doctors.isLoading && <EmptyState title="Loading verified doctors" />}
          {doctors.isError && <EmptyState title="Could not load doctors" message="Please log in again or check the backend connection." />}
          {!doctors.isLoading && !doctors.isError && !filteredDoctors.length && <EmptyState title="No doctors match this specialization" />}
          {filteredDoctors.map((doctor) => (
            <button
              className={`card text-left transition hover:border-clinic-400 ${selectedDoctor?.doctorId === doctor.doctorId ? 'border-clinic-500 ring-2 ring-clinic-100' : ''}`}
              key={doctor.doctorId}
              type="button"
              onClick={() => {
                setSelectedDoctorId(doctor.doctorId);
                setSelectedSlot('');
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-950">{doctor.fullName}</p>
                  <p className="text-sm font-semibold text-clinic-700">{doctor.specialization}</p>
                </div>
                <span className="rounded-md bg-clinic-50 p-2 text-clinic-700"><Stethoscope size={18} /></span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{doctor.qualification} · {doctor.experience} years</p>
              <dl className="mt-3 grid gap-2 text-sm text-slate-600">
                <div><dt className="font-semibold text-slate-500">Availability</dt><dd>{doctor.availability}</dd></div>
                <div><dt className="font-semibold text-slate-500">Languages</dt><dd>English, Hindi, Marathi</dd></div>
                <div><dt className="font-semibold text-slate-500">Consultation Fee</dt><dd>Rs. 300</dd></div>
                <div><dt className="font-semibold text-slate-500">Hospital</dt><dd>Arogya Rural Care Network</dd></div>
                <div><dt className="font-semibold text-slate-500">Rating</dt><dd>4.8/5</dd></div>
              </dl>
            </button>
          ))}
        </section>

        <section className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Open Slots</h2>
              <p className="mt-1 text-sm text-slate-500">{selectedDoctor ? `${selectedDoctor.fullName} on ${selectedDate}` : 'Select a doctor to see available times.'}</p>
            </div>
            <CalendarClock className="text-clinic-700" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {slotChoices.map((slot) => (
              <button className={`btn-secondary min-h-11 px-3 py-2 ${selectedSlot === slot ? 'border-clinic-500 bg-clinic-50 text-clinic-700' : ''}`} type="button" key={slot} onClick={() => setSelectedSlot(slot)}>
                {displaySlot(slot)}
              </button>
            ))}
          </div>
          {!slotChoices.length && <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-500">No open slot for this doctor and date. Try another doctor or date.</p>}
          <button className="btn-primary mt-4 w-full" disabled={!selectedDoctor || !selectedSlot || book.isPending}>
            <Video size={18} /> {book.isPending ? 'Booking...' : `Book ${watch('consultationMode')} consultation`}
          </button>
          {book.isSuccess && <p className="mt-3 text-sm font-semibold text-clinic-700">Appointment booked successfully.</p>}
        </section>

        <section className="card space-y-3">
          <h2 className="section-title">Emergency Routing</h2>
          <div className="flex flex-wrap gap-2">
            {emergencyChips.map((chip) => (
              <button className="pill" type="button" key={chip} onClick={() => setValue('emergencySymptoms', chip)}>
                {chip}
              </button>
            ))}
          </div>
          <textarea className="input min-h-24" placeholder="Describe urgent symptoms for emergency routing" {...register('emergencySymptoms')} />
          <button type="button" className="btn-primary w-full" onClick={handleSubmit(requestEmergency)} disabled={emergency.isPending}>
            <ShieldAlert size={18} /> {emergency.isPending ? 'Routing...' : 'Book Emergency'}
          </button>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" className="btn-secondary"><Stethoscope size={18} /> Nearest Care</button>
            <button type="button" className="btn-secondary"><PhoneCall size={18} /> Call Assistant</button>
          </div>
          {emergency.isSuccess && <p className="text-sm font-semibold text-clinic-700">Emergency appointment requested.</p>}
        </section>
      </form>
      <section className="space-y-3">
        <h2 className="section-title">History</h2>
        {!history.data?.length && <EmptyState title="No appointments yet" />}
        {history.data?.map((a) => (
          <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" key={a.appointmentId}>
            <div>
              <p className="font-semibold text-slate-900">{a.doctorName}</p>
              <p className="text-sm text-slate-500">{a.appointmentDate} at {a.appointmentTime}</p>
            </div>
            <span className="pill">{a.consultationMode} · {a.status}</span>
          </div>
        ))}
      </section>
    </div>
    </div>
  );
}
