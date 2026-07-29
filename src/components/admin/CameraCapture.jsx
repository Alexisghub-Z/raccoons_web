import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Video, X, SwitchCamera, Square, Loader2, AlertCircle } from 'lucide-react';
import './CameraCapture.css';

const MAX_VIDEO_SECONDS = 180; // 3 min — margen de sobra bajo el limite de 200MB

function CameraCapture({ isOpen, onClose, onCapture }) {
  const [mode, setMode] = useState('photo');       // 'photo' | 'video'
  const [facingMode, setFacingMode] = useState('environment');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  // Abrir la camara cuando se monta o cambia de camara frontal/trasera
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const start = async () => {
      setStarting(true);
      setError(null);
      stopStream();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: true
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;

        // Solo mostrar el boton de girar si hay mas de una camara
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) {
          setHasMultipleCameras(devices.filter(d => d.kind === 'videoinput').length > 1);
        }
      } catch (err) {
        if (cancelled) return;
        if (err.name === 'NotAllowedError') {
          setError('Permiso denegado. Habilita el acceso a la cámara en tu navegador.');
        } else if (err.name === 'NotFoundError') {
          setError('No se encontró ninguna cámara en este dispositivo.');
        } else if (err.name === 'NotReadableError') {
          setError('La cámara está siendo usada por otra aplicación.');
        } else {
          setError('No se pudo abrir la cámara: ' + err.message);
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    };

    start();
    return () => { cancelled = true; stopStream(); };
  }, [isOpen, facingMode, stopStream]);

  // Limpiar temporizador al desmontar
  useEffect(() => () => clearInterval(timerRef.current), []);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (!blob) return;
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      onCapture(new File([blob], `foto-${stamp}.jpg`, { type: 'image/jpeg' }));
      handleClose();
    }, 'image/jpeg', 0.92);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    // Elegir el codec que soporte este navegador
    const candidates = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mimeType = candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';

    try {
      const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const type = mimeType.split(';')[0] || 'video/webm';
        const blob = new Blob(chunksRef.current, { type });
        const ext = type.includes('mp4') ? 'mp4' : 'webm';
        const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        onCapture(new File([blob], `video-${stamp}.${ext}`, { type }));
        handleClose();
      };

      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev + 1 >= MAX_VIDEO_SECONDS) {
            stopRecording();
            return MAX_VIDEO_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError('Este navegador no permite grabar video.');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    if (recorderRef.current?.state !== 'inactive') recorderRef.current?.stop();
  };

  const handleClose = () => {
    clearInterval(timerRef.current);
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.onstop = null;   // descartar lo grabado al cancelar
      recorderRef.current.stop();
    }
    setIsRecording(false);
    setElapsed(0);
    stopStream();
    onClose();
  };

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!isOpen) return null;

  return createPortal(
    <div className="cam-overlay" onClick={handleClose}>
      <div className="cam-modal" onClick={e => e.stopPropagation()}>

        <div className="cam-header">
          <h3>{mode === 'photo' ? 'Tomar foto' : 'Grabar video'}</h3>
          <button className="cam-close" onClick={handleClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="cam-stage">
          {error ? (
            <div className="cam-error">
              <AlertCircle size={40} />
              <p>{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className={`cam-video ${facingMode === 'user' ? 'mirrored' : ''}`}
                autoPlay
                playsInline
                muted
              />
              {starting && (
                <div className="cam-loading">
                  <Loader2 size={32} className="spinning" />
                  <span>Abriendo cámara…</span>
                </div>
              )}
              {isRecording && (
                <div className="cam-rec-badge">
                  <span className="cam-rec-dot" />
                  {fmt(elapsed)}
                </div>
              )}
            </>
          )}
        </div>

        {!error && (
          <div className="cam-controls">
            <div className="cam-mode-switch">
              <button
                className={mode === 'photo' ? 'active' : ''}
                onClick={() => setMode('photo')}
                disabled={isRecording}
              >
                <Camera size={16} /> Foto
              </button>
              <button
                className={mode === 'video' ? 'active' : ''}
                onClick={() => setMode('video')}
                disabled={isRecording}
              >
                <Video size={16} /> Video
              </button>
            </div>

            <div className="cam-actions">
              {mode === 'photo' ? (
                <button className="cam-shutter" onClick={takePhoto} disabled={starting} aria-label="Tomar foto">
                  <span className="cam-shutter-inner" />
                </button>
              ) : isRecording ? (
                <button className="cam-shutter recording" onClick={stopRecording} aria-label="Detener grabación">
                  <Square size={22} fill="currentColor" />
                </button>
              ) : (
                <button className="cam-shutter record" onClick={startRecording} disabled={starting} aria-label="Grabar video">
                  <span className="cam-shutter-rec" />
                </button>
              )}

              {hasMultipleCameras && (
                <button
                  className="cam-flip"
                  onClick={() => setFacingMode(f => (f === 'environment' ? 'user' : 'environment'))}
                  disabled={isRecording || starting}
                  title="Cambiar cámara"
                >
                  <SwitchCamera size={20} />
                </button>
              )}
            </div>

            <p className="cam-hint">
              {mode === 'photo'
                ? 'La foto se agregará a la lista de evidencias'
                : `Máximo ${MAX_VIDEO_SECONDS / 60} minutos de grabación`}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default CameraCapture;
