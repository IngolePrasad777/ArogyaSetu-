import AgoraRTC from 'agora-rtc-sdk-ng';
import { createContext, useContext, useMemo } from 'react';

const AgoraContext = createContext(null);

export function AgoraProvider({ children }) {
  const client = useMemo(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }), []);
  return <AgoraContext.Provider value={{ client, appId: import.meta.env.VITE_AGORA_APP_ID }}>{children}</AgoraContext.Provider>;
}

export function useAgora() {
  return useContext(AgoraContext);
}
