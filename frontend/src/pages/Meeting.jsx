import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, LogOut, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';

const JITSI_DOMAIN = 'meet.jit.si';

function roomNameFromChannel(channel) {
  return `ArogyaSetuPlus-${String(channel || 'consultation').replace(/[^a-zA-Z0-9-]/g, '-')}`;
}

function loadJitsiScript() {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) { resolve(); return; }
    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// After Jitsi creates its internal iframe, patch the allow attribute so the
// browser grants camera/mic permissions to the meet.jit.si origin.
function patchJitsiIframePermissions(container) {
  const patch = () => {
    const iframe = container?.querySelector('iframe');
    if (iframe) {
      iframe.setAttribute(
        'allow',
        'camera; microphone; fullscreen; display-capture; autoplay; clipboard-write'
      );
    }
  };
  // Jitsi creates the iframe asynchronously — observe until it appears
  const observer = new MutationObserver(() => {
    const iframe = container?.querySelector('iframe');
    if (iframe) {
      patch();
      observer.disconnect();
    }
  });
  if (container) observer.observe(container, { childList: true, subtree: true });
  return observer;
}

export default function Meeting({ role }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const observerRef = useRef(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  const appointmentId = params.get('appointmentId');
  const channel = params.get('channel') || `arogyasetu-${appointmentId || 'consultation'}`;
  const roomName = roomNameFromChannel(channel);
  const displayName = role === 'doctor'
    ? `Dr ${profile?.email?.split('@')[0] || 'Doctor'}`
    : profile?.email?.split('@')[0] || 'Patient';
  const directUrl = `https://${JITSI_DOMAIN}/${encodeURIComponent(roomName)}`;

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

  useEffect(() => {
    let jitsiApi = null;

    const init = async () => {
      try {
        await loadJitsiScript();

        if (!containerRef.current || !window.JitsiMeetExternalAPI) {
          setError('Jitsi script failed to load.');
          return;
        }

        // Start observing before creating the API so we catch the iframe immediately
        observerRef.current = patchJitsiIframePermissions(containerRef.current);

        jitsiApi = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName },
          configOverwrite: {
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
            disableInviteFunctions: true,
            // Explicitly allow camera/mic inside the Jitsi config
            constraints: {
              video: { height: { ideal: 720, max: 1080, min: 240 } }
            }
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_ALWAYS_VISIBLE: true
          }
        });

        apiRef.current = jitsiApi;

        jitsiApi.addEventListener('videoConferenceJoined', () => setJoined(true));
        jitsiApi.addEventListener('readyToClose', () => {
          navigate(role === 'doctor' ? '/doctor/consultation' : '/patient/consultation');
        });
        jitsiApi.addEventListener('errorOccurred', (e) => {
          console.error('Jitsi error:', e);
        });
      } catch (err) {
        console.error('Jitsi init error:', err);
        setError('Could not load the meeting room. Use "Open in new tab" to join directly.');
      }
    };

    init();

    return () => {
      observerRef.current?.disconnect();
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch (_) {}
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, role, navigate]);

  const leave = () => {
    if (apiRef.current) {
      try { apiRef.current.executeCommand('hangup'); } catch (_) {}
    }
    navigate(role === 'doctor' ? '/doctor/consultation' : '/patient/consultation');
  };

  return (
    <div>
      <PageHeader
        title="Video Consultation"
        eyebrow={role === 'doctor' ? 'Doctor meeting room' : 'Patient meeting room'}
      >
        Jitsi room for this appointment. Doctor and patient join the same room automatically.
      </PageHeader>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-clinic-50 p-2 text-clinic-700"><Video size={20} /></span>
            <div>
              <h2 className="font-bold text-slate-950">ArogyaSetu+ Jitsi Meeting</h2>
              <p className="text-sm text-slate-500">
                Room: {roomName} · {joined ? '🟢 Connected' : '⏳ Connecting...'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="btn-secondary" href={directUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={18} /> Open in new tab
            </a>
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

        {/* Camera permission hint — shown until joined */}
        {!joined && !error && (
          <div className="border-b border-clinic-100 bg-clinic-50 px-4 py-3 text-sm text-clinic-800">
            <strong>Allow camera and microphone</strong> when your browser prompts. If you already denied it,
            click the 🔒 icon in your browser address bar and reset permissions for this site.
          </div>
        )}

        {error ? (
          <div className="flex h-[72vh] min-h-[560px] flex-col items-center justify-center gap-4 bg-slate-950 p-8 text-center">
            <Video className="text-slate-500" size={48} />
            <p className="text-slate-300">{error}</p>
            <a className="btn-primary" href={directUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={18} /> Open Jitsi in new tab
            </a>
          </div>
        ) : (
          <div ref={containerRef} className="h-[72vh] min-h-[560px] bg-slate-950" />
        )}
      </section>
    </div>
  );
}
