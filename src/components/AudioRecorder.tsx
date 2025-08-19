import React, { useEffect, useRef, useState } from 'react';

interface DeviceOption {
  deviceId: string;
  label: string;
}

export function AudioRecorder() {
  const [micDevices, setMicDevices] = useState<DeviceOption[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [recording, setRecording] = useState(false);
  const [micLevel, setMicLevel] = useState<number | null>(null);
  const [audioLevel, setAudioLevel] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  // Get available mic devices
  useEffect(() => {
    async function getDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setMicDevices(
        devices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || 'Microphone',
          }))
      );
    }
    getDevices();
  }, []);

  // Monitor mic audio level only
  useEffect(() => {
    let micAnalyser: AnalyserNode | null = null;
    let micSource: MediaStreamAudioSourceNode | null = null;
    let audioCtx: AudioContext | null = null;

    function animate() {
      if (micAnalyser) {
        const data = new Uint8Array(micAnalyser.fftSize);
        micAnalyser.getByteTimeDomainData(data);
        const rms =
          Math.sqrt(
            data.reduce((sum, v) => sum + Math.pow((v - 128) / 128, 2), 0) /
              data.length
          ) || 0.0001;
        setMicLevel(Math.round(20 * Math.log10(rms)));
      } else {
        setMicLevel(null);
      }
      animationRef.current = requestAnimationFrame(animate);
    }

    if (recording && micStreamRef.current && micStreamRef.current.getAudioTracks().length) {
      audioCtx = new AudioContext();
      micSource = audioCtx.createMediaStreamSource(micStreamRef.current);
      micAnalyser = audioCtx.createAnalyser();
      micAnalyser.fftSize = 256;
      micSource.connect(micAnalyser);
      animate();
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtx) audioCtx.close();
    };
  }, [recording]);

  // Start recording
  const startRecording = async () => {
    // Get mic stream
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: selectedMic ? { exact: selectedMic } : undefined },
    });
    micStreamRef.current = micStream;

    // Get desktop audio stream
    // @ts-ignore
    const audioStream = await (navigator.mediaDevices as any).getDisplayMedia({
      audio: true,
      video: false,
    });
    audioStreamRef.current = audioStream;

    // Combine tracks
    const combinedStream = new MediaStream([
      ...micStream.getAudioTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    mediaRecorderRef.current = new MediaRecorder(combinedStream);
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
    setMicLevel(null);
    setAudioLevel(null);
  };

  return (
    <div className="w-full max-w-md mx-0 mt-10 bg-[#0B0F22] rounded-xl p-6 shadow border border-[#5A54E9]">
      <div className="flex items-center mb-6">
        <span className="text-lg font-bold text-white mr-4">Audio Recorder</span>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            recording
              ? 'bg-[#29B5FD] text-[#0B0F22]'
              : 'bg-[#4C43EB] text-white'
          }`}
        >
          {recording ? 'Recording...' : 'Idle'}
        </span>
      </div>
      <div className="mb-4">
        <label className="block text-[#29B5FD] mb-1 font-medium">
          Microphone
        </label>
        <select
          className="w-full bg-[#0C1018] text-white border border-[#5A54E9] rounded px-3 py-2"
          value={selectedMic}
          onChange={(e) => setSelectedMic(e.target.value)}
        >
          <option value="">Default</option>
          {micDevices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-[#29B5FD] mb-1 font-medium">
          Desktop Audio (choose when prompted)
        </label>
      </div>
      <div className="mb-6">
        <label className="block text-[#5A54E9] mb-1 font-medium">
          Mic Level
        </label>
        <div className="w-full h-3 bg-[#0C1018] rounded">
          <div
            className="h-3 rounded bg-[#29B5FD] transition-all"
            style={{
              width: micLevel !== null
                ? `${Math.min(Math.max((micLevel + 60) * 1.5, 0), 100)}%`
                : '0%',
            }}
          />
        </div>
        <span className="text-xs text-[#29B5FD]">
          {micLevel !== null ? `${micLevel} dB` : 'No audio detected'}
        </span>
      </div>
      <div className="mb-6">
        <label className="block text-[#5A54E9] mb-1 font-medium">
          Desktop Audio Level
        </label>
        <div className="w-full h-3 bg-[#0C1018] rounded">
          <div
            className="h-3 rounded bg-[#5A54E9] transition-all"
            style={{
              width: audioLevel !== null
                ? `${Math.min(Math.max((audioLevel + 60) * 1.5, 0), 100)}%`
                : '0%',
            }}
          />
        </div>
        <span className="text-xs text-[#5A54E9]">
          {audioLevel !== null ? `${audioLevel} dB` : 'No audio detected'}
        </span>
      </div>
      <div className="flex space-x-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-6 py-2 rounded bg-[#5A54E9] text-white font-semibold hover:bg-[#4C43EB] transition"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-6 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
}