import { useQuery } from '@tanstack/react-query';
import { CalendarClock, FileText, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchDoctorQueue } from '../../services/doctorApi.js';
import { formatDateTime, patientName, priorityTone } from '../../utils/doctorWorkspace.js';
import { consultationStatus, doctorJoinWindow, readWaitingRoom } from '../../utils/patientWorkspace.js';

export default function DoctorAppointments() {
  const queue = useQuery({ queryKey: ['doctor-queue'], queryFn: fetchDoctorQueue });

  return (
    <div>
      <PageHeader title="Appointment Queue" eyebrow="Doctor workspace">
        Open patient records, review AI priority and symptoms, then start the consultation from the assigned care queue.
      </PageHeader>
      <div className="space-y-4">
        {!queue.data?.length && <EmptyState title="No assigned appointments" />}
        {queue.data?.map((item) => {
          const appointment = item.appointment;
          const symptom = item.latestSymptom;
          const level = symptom?.triageLevel || 'LOW';
          const room = readWaitingRoom(appointment.appointmentId);
          const patientStatus = consultationStatus(appointment, room);
          const { opensAt, closesAt } = doctorJoinWindow(appointment);
          const doctorCanJoin = Date.now() >= opensAt.getTime() && Date.now() <= closesAt.getTime();
          return (
            <article className={`card border-l-4 ${priorityTone(level)}`} key={appointment.appointmentId}>
              <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
                <div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Patient</p>
                      <h2 className="text-xl font-bold text-slate-950">{patientName(item.patient)}</h2>
                    </div>
                    <span className={`pill border ${priorityTone(level)}`}>AI Priority: {level}</span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-md bg-white/70 p-3">
                      <p className="text-sm font-semibold text-slate-500">Symptoms</p>
                      <p className="mt-1 text-slate-900">{symptom?.symptoms || 'No symptom summary recorded.'}</p>
                      <p className="mt-1 text-sm text-slate-500">Duration: {symptom?.duration || '-'}</p>
                    </div>
                    <div className="rounded-md bg-white/70 p-3">
                      <p className="text-sm font-semibold text-slate-500">Appointment</p>
                      <p className="mt-1 flex items-center gap-2 font-semibold text-slate-900"><CalendarClock size={18} /> {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}</p>
                      <p className="mt-1 text-sm text-slate-500">{appointment.consultationMode} · {appointment.status}</p>
                      <p className="mt-1 text-sm font-semibold text-clinic-700">Patient Status: {patientStatus}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <Link className="btn-secondary" to={`/doctor/patients/${appointment.patientId}`}>
                    <FileText size={18} /> Open EHR
                  </Link>
                  <Link className={`btn-primary ${doctorCanJoin ? '' : 'pointer-events-none opacity-60'}`} to={`/doctor/consultation?appointmentId=${appointment.appointmentId}`}>
                    <Stethoscope size={18} /> Start Consultation
                  </Link>
                  {!doctorCanJoin && <p className="text-xs font-semibold text-orange-700">Doctor window opens 15 min before appointment.</p>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
