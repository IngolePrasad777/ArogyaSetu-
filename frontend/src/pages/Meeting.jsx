import AgoraRTC from 'agora-rtc-sdk-ng';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, LogOut, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';
import { useAuthStore } from '../store/authStore.js';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

// Derive a numeric UID from the user's role so doctor and patient get different UIDs
function uidFromRole(role) {
  return role === 'doctor' ? 1 : 2;
}

export default function Meeting({ role }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const appointmentId = params.get('appointmentId');
  const channel = params.get('channel') || `arogyasetu-${appointmentId || 'consultation'}`;

  // Agora state
  const clientRef = useRef(null);
  const localTracksRef = useRef({ audio: null, video: null });
  const [joined, setJoined] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [error, setError] = useState(null);
  const localVideoRef = useRef(null);

  const completeConsultation = useMutation({
    mutationFn: () => api.post('/doctor/consultation', {
      appointmentId,
      mode: 'VIDEO',
      notes: 'Video consultation completed via Agora meeting.',
      diagnosis: 'Diagnosis to be finalized in prescription workflow.'
    }),
    onSuccess: (response) => {
      navigate(`/doctor/prescription?consultationId=${response.data.consultationId}`);
    }
  });

  useEffect(() => {
    if (!APP_ID) {
      setError('Agora App ID is not configured. Set VITE_AGORA_APP_ID in frontend/.env');
      return;
    }

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    // Remote user joined — play their video/audio
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        setRemoteUsers((prev) => {
          const exists = prev.find((u) => u.uid === user.uid);
          return exists ? prev.map((u) => u.uid === user.uid ? user : u) : [...prev, user];
        });
        // Play into a div after React renders it
        setTimeout(() => {
          const el = document.getElementById(`remote-${user.uid}`);
          if (el) user.videoTrack?.play(el);
        }, 100);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });

    client.on('user-unpublished', (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    client.on('user-left', (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    const join = async () => {
      try {
        // Use null token for testing (works for Agora projects with no token auth)
        // In production replace with a real token from your token server
        const token = import.meta.env.VITE_AGORA_TEMP_TOKEN || null;
        const uid = uidFromRole(role);

        await client.join(APP_ID, channel, token, uid);

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { audio: audioTrack, video: videoTrack };

        // Play local video
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        await client.publish([audioTrack, videoTrack]);
        setJoined(true);
      } catch (err) {
        console.error('Agora join error:', err);
        if (err.code === 'PERMISSION_DENIED' || String(err).includes('Permission')) {
          setError('Camera or microphone permission was denied. Please allow access in your browser and reload.');
        } else if (err.code === 'INVALID_PARAMS' || String(err).includes('token')) {
          setError('Agora token is invalid or expired. For local testing, disable token authentication in your Agora project console (set to "No certificate").');
        } else {
          setError(`Could not join meeting: ${err.message || err}`);
        }
      }
    };

    join();

    return () => {
      const { audio, video } = localTracksRef.current;
      audio?.close();
      video?.close();
      client.leave().catch(() => {});
    };
  }, [channel, role]);

  // Play local video once ref is ready
  useEffect(() => {
    if (joined && localVideoRef.current && localTracksRef.current.video) {
      localTracksRef.current.video.play(localVideoRef.current);
    }
  }, [joined]);

  const toggleAudio = async () => {
    const track = localTracksRef.current.audio;
    if (!track) return;
    await track.setMuted(!audioMuted);
    setAudioMuted(!audioMuted);
  };

  const toggleVideo = async () => {
    const track = localTracksRef.current.video;
    if (!track) return;
    await track.setMuted(!videoMuted);
    setVideoMuted(!videoMuted);
  };

  const leave = async () => {
    const { audio, video } = localTracksRef.current;
    audio?.close();
    video?.close();
    await clientRef.current?.leave().catch(() => {});
    navigate(role === 'doctor' ? '/doctor/consultation' : '/patient/consultation');
  };

  return (
    <div>
      <PageHeader
        title="Video Consultation"
        eyebrow={role === 'doctor' ? 'Doctor meeting room' : 'Patient meeting room'}
      >
        Agora RTC room for this appointment. Doctor and patient join the same channel.
      </PageHeader>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-clinic-50 p-2 text-clinic-700"><Video size={20} /></span>
            <div>
              <h2 className="font-bold text-slate-950">ArogyaSetu+ Video Consultation</h2>
              <p className="text-sm text-slate-500">Channel: {channel} · {joined ? '🟢 Connected' : '⏳ Connecting...'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`btn-secondary ${audioMuted ? 'border-rose-400 text-rose-700' : ''}`}
              type="button"
              disabled={!joined}
              onClick={toggleAudio}
            >
              {audioMuted ? <MicOff size={18} /> : <Mic size={18} />}
              {audioMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              className={`btn-secondary ${videoMuted ? 'border-rose-400 text-rose-700' : ''}`}
              type="button"
              disabled={!joined}
              onClick={toggleVideo}
            >
              {videoMuted ? <VideoOff size={18} /> : <Video size={18} />}
              {videoMuted ? 'Start video' : 'Stop video'}
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

        {/* Warnings */}
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

        {/* Error state */}
        {error && (
          <div className="border-b border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            {error.includes('token') && (
              <p className="mt-1 text-xs text-rose-700">
                Go to <a className="underline" href="https://console.agora.io" target="_blank" rel="noreferrer">console.agora.io</a> → your project → Edit → set Authentication Mechanism to <strong>"No certificate"</strong> for local testing.
              </p>
            )}
          </div>
        )}

        {/* Video grid */}
        <div className="grid min-h-[560px] gap-2 bg-slate-950 p-3"
          style={{ gridTemplateColumns: remoteUsers.length ? '1fr 1fr' : '1fr' }}>
          {/* Local video */}
          <div className="relative overflow-hidden rounded-lg bg-slate-800">
            <div ref={localVideoRef} className="h-full w-full" />
            {!joined && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm font-semibold text-slate-400">Connecting camera...</p>
              </div>
            )}
            <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
              You ({role})
            </span>
            {videoMuted && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <VideoOff className="text-slate-500" size={40} />
              </div>
            )}
          </div>

          {/* Remote users */}
          {remoteUsers.map((user) => (
            <div key={user.uid} className="relative overflow-hidden rounded-lg bg-slate-800">
              <div id={`remote-${user.uid}`} className="h-full w-full" />
              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                {role === 'doctor' ? 'Patient' : 'Doctor'}
              </span>
            </div>
          ))}

          {/* Waiting for other party */}
          {joined && remoteUsers.length === 0 && (
            <div className="flex items-center justify-center rounded-lg bg-slate-800">
              <p className="text-sm font-semibold text-slate-400">
                Waiting for {role === 'doctor' ? 'patient' : 'doctor'} to join...
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
