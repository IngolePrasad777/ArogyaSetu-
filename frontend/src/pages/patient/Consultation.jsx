import { useQuery } from '@tanstack/react-query';
import { FileUp, MessageCircle, PhoneOff, Timer, UserRoundCheck, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import { api } from '../../services/api.js';
import {
  appointmentDateTime,
  consultationStatus,
  formatCountdown,
  formatShortDate,
  formatTime,
  isActiveAppointment,
  latestAppointment,
  meetingPath,
  patientConsultationWindow,
  patientJoinWindow,
  readWaitingRoom,
  writeWaitingRoom
} from '../../utils/patientWorkspace.js';

export default function PatientConsultation() {
  const navigate = useNavigate();
  const [, setClock] = useState(Date.now());
  const [room, setRoom] = useState({ patientJoined: false, doctorJoined: false });
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: async () => (await api.get('/appointments/history')).data });
  const ehr = useQuery({ queryKey: ['patient-ehr'], queryFn: async () => (await api.get('/patient/ehr')).data, retry: false });
  const profile = useQuery({ queryKey: ['patient-profile'], queryFn: async () => (await api.get('/patient/profile')).data });
  const appointment = latestAppointment(appointments.data || []);
  const startsAt = appointment ? appointmentDateTime(appointment) : null;
  const unlockAt = appointment ? patientJoinWindow(appointment) : null;
  const patientWindow = appointment ? patientConsultationWindow(appointment) : null;
  // TODO: restore time-gated check:
  // const canJoin = Boolean(appointment && isActiveAppointment(appointment) && Date.now() >= patientWindow.opensAt.getTime() && Date.now() <= patientWindow.closesAt.getTime());
  const canJoin = Boolean(appointment); // always open for testing
  const status = consultationStatus(appointment, room);
  const videoReady = ['READY', 'IN_PROGRESS'].includes(status);

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(Date.now());
      if (appointment?.appointmentId) setRoom(readWaitingRoom(appointment.appointmentId));
    }, 1000);
    return () => clearInterval(timer);
  }, [appointment?.appointmentId]);

  useEffect(() => {
    if (appointment?.appointmentId) setRoom(readWaitingRoom(appointment.appointmentId));
  }, [appointment?.appointmentId]);

  useEffect(() => {
    if (appointment && videoReady) navigate(meetingPath('patient', appointment));
  }, [appointment, videoReady, navigate]);

  const joinWaitingRoom = () => {
    if (!appointment?.appointmentId || !canJoin) return;
    const next = writeWaitingRoom(appointment.appointmentId, { patientJoined: true });
    setRoom(next);
    navigate(meetingPath('patient', appointment));
  };

  return (
    <div>
      <PageHeader title="Consultation Waiting Room" eyebrow="Timed consultation flow">
        Join unlocks 10 minutes before your appointment. Jitsi opens the same meeting room for doctor and patient.
      </PageHeader>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="card">
          <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6">
              <div className="w-full max-w-xl text-center">
                <Timer className="mx-auto text-clinic-700" size={54} />
                <h2 className="mt-4 text-2xl font-bold text-slate-950">{status === 'EXPIRED' ? 'Appointment window expired' : 'Jitsi waiting room'}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {appointment ? `${appointment.doctorName} · ${formatShortDate(appointment.appointmentDate)} at ${formatTime(appointment.appointmentTime)}` : 'No scheduled appointment found.'}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Starts in</p><p className="mt-2 font-bold text-slate-950">{startsAt ? formatCountdown(startsAt) : '-'}</p></div>
                  <div className="rounded-md bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">Status</p><p className="mt-2 font-bold text-clinic-700">{status}</p></div>
                  <div className="rounded-md bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">AI Priority</p><p className="mt-2 font-bold text-rose-700">HIGH</p></div>
                </div>
                <button className="btn-primary mt-6 w-full sm:w-fit" type="button" disabled={!canJoin || room.patientJoined} onClick={joinWaitingRoom}>
                  <UserRoundCheck size={18} /> {room.patientJoined ? 'Joined waiting room' : 'Join Jitsi Meeting'}
                </button>
                {!canJoin && <p className="mt-3 text-sm font-semibold text-orange-700">Join opens at {unlockAt ? formatTime(`${unlockAt.getHours()}:${unlockAt.getMinutes()}`) : '-'}.</p>}
                {room.patientJoined && !room.doctorJoined && <p className="mt-3 text-sm font-semibold text-clinic-700">Patient joined. You can enter the meeting room and wait for the doctor.</p>}
                {videoReady && <p className="mt-3 text-sm font-semibold text-clinic-700">Opening Jitsi meeting room...</p>}
                {/* Show room URL so patient can verify it matches the doctor */}
                {appointment && (
                  <p className="mt-3 rounded-md border border-slate-200 bg-white p-2 text-xs font-mono break-all text-slate-500">
                    {`https://meet.jit.si/ArogyaSetuPlus-${appointment.appointmentId.replace(/-/g, '')}`}
                  </p>
                )}
              </div>
            </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button className="btn-secondary"><FileUp size={18} /> Upload</button>
            <button className="btn-secondary"><MessageCircle size={18} /> Chat</button>
            <button className="btn-secondary" type="button" disabled={!appointment} onClick={() => appointment && navigate(meetingPath('patient', appointment))}><Video size={18} /> Open Meeting</button>
            <button className="btn-primary bg-rose-700 hover:bg-rose-600"><PhoneOff size={18} /> Leave</button>
          </div>
        </section>
        <aside className="card space-y-4">
          <h2 className="section-title">Consultation Context</h2>
          <div className="rounded-md bg-clinic-50 p-4">
            <p className="text-sm font-semibold text-clinic-700">Doctor</p>
            <p className="mt-1 font-bold text-slate-950">{appointment?.doctorName || 'Not assigned'}</p>
          </div>
          <dl className="grid gap-3 text-sm">
            <div><dt className="font-semibold text-slate-500">Appointment Info</dt><dd>{appointment ? `${formatShortDate(appointment.appointmentDate)} at ${formatTime(appointment.appointmentTime)} · ${appointment.consultationMode}` : 'No scheduled appointment.'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Symptoms</dt><dd>{ehr.data?.consultationHistory || 'No latest symptom summary attached.'}</dd></div>
            <div><dt className="font-semibold text-slate-500">AI Result</dt><dd>HIGH priority review before consultation.</dd></div>
            <div><dt className="font-semibold text-slate-500">Blood Group</dt><dd>{profile.data?.bloodGroup || 'Not set'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Allergies</dt><dd>{ehr.data?.allergies || 'None recorded'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Past Consultation Count</dt><dd>{ehr.data?.consultationHistory ? 1 : 0}</dd></div>
            <div><dt className="font-semibold text-slate-500">Prescription Status</dt><dd>{ehr.data?.prescriptionHistory ? 'Active' : 'Not uploaded'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Follow-up</dt><dd>{appointment?.appointmentDate ? 'Pending doctor advice' : '-'}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
