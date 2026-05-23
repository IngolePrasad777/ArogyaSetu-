import { useQuery } from '@tanstack/react-query';
import { Timer, UserRoundCheck, Video } from 'lucide-react';
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
  meetingPath,
  readWaitingRoom,
  writeWaitingRoom
} from '../../utils/patientWorkspace.js';

function jitsiRoomUrl(appointmentId) {
  if (!appointmentId) return '';
  return `https://meet.jit.si/ArogyaSetuPlus-${String(appointmentId).replace(/-/g, '')}`;
}

export default function PatientConsultation() {
  const navigate = useNavigate();
  const [, setClock] = useState(Date.now());
  const [selectedId, setSelectedId] = useState('');
  const [room, setRoom] = useState({ patientJoined: false, doctorJoined: false });

  const appointments = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => (await api.get('/appointments/history')).data,
    staleTime: 0
  });
  const ehr = useQuery({ queryKey: ['patient-ehr'], queryFn: async () => (await api.get('/patient/ehr')).data, retry: false });
  const profile = useQuery({ queryKey: ['patient-profile'], queryFn: async () => (await api.get('/patient/profile')).data });

  // All non-cancelled appointments available for selection
  const available = (appointments.data || []).filter((a) => a.status !== 'CANCELLED');

  // Auto-select first appointment on load
  useEffect(() => {
    if (!selectedId && available.length > 0) {
      setSelectedId(available[0].appointmentId);
    }
  }, [available.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const appointment = available.find((a) => a.appointmentId === selectedId) || null;
  const startsAt = appointment ? appointmentDateTime(appointment) : null;
  const status = consultationStatus(appointment, room);
  const meetUrl = jitsiRoomUrl(appointment?.appointmentId);

  // TODO: restore time-gated check
  const canJoin = Boolean(appointment);

  // Poll waiting room state every second
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

  const joinMeeting = () => {
    if (!appointment?.appointmentId || !canJoin) return;
    writeWaitingRoom(appointment.appointmentId, { patientJoined: true });
    navigate(meetingPath('patient', appointment));
  };

  return (
    <div>
      <PageHeader title="Consultation Waiting Room" eyebrow="Select your appointment">
        Select the appointment you want to join, then click Join Meeting to open the Jitsi room.
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">

          {/* Appointment selector */}
          <div className="card space-y-3">
            <h2 className="section-title">Select Appointment</h2>
            {appointments.isLoading && <p className="text-sm text-slate-500">Loading appointments...</p>}
            {!appointments.isLoading && !available.length && (
              <p className="text-sm text-slate-500">No appointments found. Book one from the Appointments page.</p>
            )}
            <div className="grid gap-2">
              {available.map((a) => (
                <button
                  key={a.appointmentId}
                  type="button"
                  onClick={() => setSelectedId(a.appointmentId)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selectedId === a.appointmentId
                      ? 'border-clinic-600 bg-clinic-50 ring-2 ring-clinic-100'
                      : 'border-slate-200 bg-white hover:border-clinic-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{a.doctorName}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatShortDate(a.appointmentDate)} at {formatTime(a.appointmentTime)} · {a.consultationMode}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-400">
                        ID: {a.appointmentId}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      a.status === 'SCHEDULED' ? 'bg-emerald-50 text-emerald-700' :
                      a.status === 'COMPLETED' ? 'bg-slate-100 text-slate-500' :
                      'bg-amber-50 text-amber-700'
                    }`}>{a.status}</span>
                  </div>
                  {selectedId === a.appointmentId && (
                    <p className="mt-2 break-all font-mono text-xs text-clinic-600">
                      {jitsiRoomUrl(a.appointmentId)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Waiting room panel */}
          {appointment && (
            <div className="card">
              <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6">
                <div className="w-full max-w-xl text-center">
                  <Timer className="mx-auto text-clinic-700" size={48} />
                  <h2 className="mt-4 text-xl font-bold text-slate-950">
                    {appointment.doctorName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatShortDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-md bg-white p-3">
                      <p className="text-xs font-bold uppercase text-slate-500">Starts in</p>
                      <p className="mt-1 font-bold text-slate-950">{startsAt ? formatCountdown(startsAt) : '-'}</p>
                    </div>
                    <div className="rounded-md bg-white p-3">
                      <p className="text-xs font-bold uppercase text-slate-500">Status</p>
                      <p className="mt-1 font-bold text-clinic-700">{status}</p>
                    </div>
                    <div className="rounded-md bg-white p-3">
                      <p className="text-xs font-bold uppercase text-slate-500">Mode</p>
                      <p className="mt-1 font-bold text-slate-950">{appointment.consultationMode}</p>
                    </div>
                  </div>

                  <button
                    className="btn-primary mt-6 w-full sm:w-auto"
                    type="button"
                    disabled={!canJoin}
                    onClick={joinMeeting}
                  >
                    <UserRoundCheck size={18} />
                    Join Meeting
                  </button>

                  {room.patientJoined && !room.doctorJoined && (
                    <p className="mt-3 text-sm font-semibold text-clinic-700">
                      You joined. Waiting for the doctor to join.
                    </p>
                  )}

                  <p className="mt-3 break-all rounded-md border border-slate-200 bg-white p-2 font-mono text-xs text-slate-500">
                    {meetUrl}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="btn-secondary"
                  type="button"
                  disabled={!appointment}
                  onClick={() => appointment && navigate(meetingPath('patient', appointment))}
                >
                  <Video size={18} /> Open Meeting Page
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Context sidebar */}
        <aside className="card space-y-4">
          <h2 className="section-title">Consultation Context</h2>
          <div className="rounded-md bg-clinic-50 p-4">
            <p className="text-sm font-semibold text-clinic-700">Doctor</p>
            <p className="mt-1 font-bold text-slate-950">{appointment?.doctorName || 'Select an appointment'}</p>
          </div>
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Date &amp; Time</dt>
              <dd>{appointment ? `${formatShortDate(appointment.appointmentDate)} at ${formatTime(appointment.appointmentTime)}` : '-'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Mode</dt>
              <dd>{appointment?.consultationMode || '-'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Blood Group</dt>
              <dd>{profile.data?.bloodGroup || 'Not set'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Allergies</dt>
              <dd>{ehr.data?.allergies || 'None recorded'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Prescription Status</dt>
              <dd>{ehr.data?.prescriptionHistory ? 'Active' : 'None'}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
