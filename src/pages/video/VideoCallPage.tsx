import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PhoneOff } from 'lucide-react';

declare global { interface Window { JitsiMeetExternalAPI: any; } }

export const VideoCallPage: React.FC = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      if (!containerRef.current) return;
      apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName: `nexus-meeting-${meetingId}`,
        parentNode: containerRef.current,
        width: '100%',
        height: '100%',
        userInfo: { displayName: user?.name ?? 'Nexus User' },
        configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false },
      });
      apiRef.current.addListener('readyToClose', () => navigate('/meetings'));
    };
    document.body.appendChild(script);
    return () => { apiRef.current?.dispose?.(); if (document.body.contains(script)) document.body.removeChild(script); };
  }, [meetingId, navigate, user]);

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900">
      <div className="px-4 py-2 bg-gray-800 text-white flex justify-between items-center">
        <span className="font-medium">Nexus Meeting — Room {meetingId?.slice(0, 8)}</span>
        <button onClick={() => navigate('/meetings')} className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-md text-sm hover:bg-red-700">
          <PhoneOff size={14} /> Leave
        </button>
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  );
};
