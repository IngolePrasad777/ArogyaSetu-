import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, LogOut, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';

// Room name derived only from appointmentId so doctor and patient always
// land in the exact same room regardless of how they navigated here.
function roomName(appointmentId) {
  if (!appointmentId) return 'ArogyaSetuPlus-lobby';
  return `ArogyaSetuPlus-${String(appointmentId).replace(/-/g, '')}`;
}

// Build a Jitsi URL that opens directly without login.
// Using meet.jit.si with config params in the fragment bypasses the prejoin
// and auth screens when opened as a top-level page (not embedded).
function jitsiUrl(room, displayName) {
  const fragment = [
    'config.prejoinPageEnabled=false',
    'config.prejoinConfig.enabled=false',
    'config.requireDisplayName=false',
    'config.startWithAudioMuted=false',
    'config.startWithVideoMuted=false',
    'config.disableDeepLinking=true',
    'config.enableWelcomePage=false',
    `userInfo.displayName="${encodeURIComponent(displayName)}"`,
    'interfaceConfig.SHOW_JITSI_WATERMARK=false',
    'interfaceConfig.TOOLBAR_ALWAYS_VISIBLE=true'
  ].join('&');
  return `https://meet.jit.si/${encodeURIComponent(room)}#${fragment}`;
}

export default function Meeting({ role }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const windowRef = useRef(null);
  const [opened, setOpened] = useState(false);

  const appointmentId = params.get('appointmentId');
  const room = roomName(appointmentId);
  const displayName = role === 'doctor'
    ? `Dr ${profile?.email?.split('@')[0] || 'Doctor'}`
    : profile?.email?.split('@')[0] || 'Patient';
  const meetUrl = jitsiUrl(room, displayName);

  const completeConsultation = useMutation({
    mutationFn: () => api.post('/doctor/consultation', {
      appointmentId,
      mode: 'VIDEO',
      notes: 'Video consultation completed via Jitsi meeting.',
      diagnosis: 'Diagnosis to be finalized in prescription workflow.'
    }),
    onSuccess: (response) => {
      navigate(`/doctor/prescription?consultationId=${response.data.consultationId}`);
    }
  });

  // Auto-open the meeting in a new tab when the page loads
  useEffect(() => {
    if (!opened) {
      windowRef.current = window.open(meetUrl, `jitsi-${room}`);
      setOpened(true);
    }
    return () => {
      // Don't close the window on unmount — user may still be in the call
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const openMeeting = () => {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus();
    } else {
      windowRef.current = window.open(meetUrl, `jitsi-${room}`);
    }
  };

  const leave = () => {
    navigate(role === 'doctor' ? '/doctor/consultation' : '/patient/consultation');
  };

  return (
    <div>
      <PageHeader
        title="Video Consultation"
        eyebrow={role === 'doctor' ? 'Doctor meeting room' : 'Patient meeting room'}
      >
        Jitsi meeting opened in a new tab. Doctor and patient join the same room automatically.
      </PageHeader>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-clinic-50 p-2 text-clinic-700"><Video size={20} /></span>
            <div>
              <h2 className="font-bold text-slate-950">ArogyaSetu+ Jitsi Meeting</h2>
              <p className="text-sm text-slate-500 font-mono break-all">Room: {room}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" type="button" onClick={openMeeting}>
              <ExternalLink size={18} /> {opened ? 'Rejoin / Focus tab' : 'Open Meeting'}
            </button>
            {role === 'doctor' && (
              <button
                className="btn-primary"
                type="button"
                disabled={!appointmentId || completeConsultation.isPending}
                onClick={() => completeConsultation.mutate()}
              >
                <CheckCircle2 size={18} />
                {completeConsultation.isPending ? 'Completing...' : 'Complete Consultation'}
              </button>
            )}
            <button className="btn-primary bg-rose-700 hover:bg-rose-600" type="button" onClick={leave}>
              <LogOut size={18} /> Leave
            </button>
          </div>
        </div>

        {role === 'doctor' && !appointmentId && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Appointment ID missing — prescription generation will not be available from this meeting.
          </div>
        )}
        {completeConsultation.isError && (
          <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            Could not complete consultation. Return to the consultation page and try again.
          </div>
        )}

        {/* Main info panel */}
        <div className="flex min-h-[480px] flex-col items-center justify-center gap-6 bg-slate-950 p-8 text-center">
          <div className="rounded-full bg-clinic-700/20 p-6">
            <Video className="text-clinic-400" size={56} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {opened ? 'Meeting is open in another tab' : 'Opening meeting...'}
            </h3>
            <p className="mt-2 text-slate-400">
              The Jitsi room has been opened in a new browser tab.<br />
              Both doctor and patient join the same room — <span className="font-mono text-clinic-400">{room}</span>
            </p>
          </div>

          <div className="grid w-full max-w-md gap-3 rounded-lg border border-slate-700 bg-slate-900 p-4 text-left text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Your name in meeting</span>
              <span className="font-semibold text-white">{displayName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Role</span>
              <span className="font-semibold text-white capitalize">{role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Meeting link</span>
              <a href={meetUrl} target="_blank" rel="noreferrer" className="font-semibold text-clinic-400 hover:underline">
                Open directly ↗
              </a>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn-primary" type="button" onClick={openMeeting}>
              <ExternalLink size={18} /> {opened ? 'Rejoin / Focus tab' : 'Open Meeting'}
            </button>
            {role === 'doctor' && (
              <button
                className="btn-secondary"
                type="button"
                disabled={!appointmentId || completeConsultation.isPending}
                onClick={() => completeConsultation.mutate()}
              >
                <CheckCircle2 size={18} />
                {completeConsultation.isPending ? 'Completing...' : 'Complete & go to prescription'}
              </button>
            )}
          </div>

          {opened && (
            <p className="text-xs text-slate-500">
              If the tab was blocked by your browser, click "Open Meeting" above or check your popup blocker.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
