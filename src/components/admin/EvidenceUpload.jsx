import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Loader2, Trash2, Video, Camera } from 'lucide-react';
import { serviceService } from '../../api/service.service';
import CameraCapture from './CameraCapture';
import './EvidenceUpload.css';

function EvidenceUpload({ serviceId, onUploadSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Valida un File y lo convierte al formato de la lista de seleccionados
  const buildEntry = (file) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isVideo && !isPDF) {
      return { error: 'Solo se permiten imágenes, videos y PDFs' };
    }

    const maxSize = isVideo ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        error: isVideo
          ? 'Cada video debe pesar máximo 200MB'
          : 'Cada imagen/PDF debe pesar máximo 10MB'
      };
    }

    return {
      entry: {
        file,
        preview: (isImage || isVideo) ? URL.createObjectURL(file) : null,
        type: isImage ? 'IMAGE' : isVideo ? 'VIDEO' : 'PDF'
      }
    };
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validar que no sean más de 10 archivos en total
    if (selectedFiles.length + files.length > 10) {
      setUploadError('Máximo 10 archivos permitidos');
      return;
    }

    const validFiles = [];
    let lastError = null;
    for (const file of files) {
      const { entry, error } = buildEntry(file);
      if (error) lastError = error;
      else validFiles.push(entry);
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
    setUploadError(lastError);

    // Permite volver a elegir el mismo archivo si se quitó de la lista
    e.target.value = '';
  };

  // Recibe la foto o video capturado desde la cámara
  const handleCameraCapture = (file) => {
    if (selectedFiles.length >= 10) {
      setUploadError('Máximo 10 archivos permitidos');
      return;
    }

    const { entry, error } = buildEntry(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setSelectedFiles(prev => [...prev, entry]);
    setUploadError(null);
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Selecciona al menos un archivo');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const files = selectedFiles.map(f => f.file);
      await serviceService.uploadEvidence(serviceId, files);

      // Limpiar archivos seleccionados
      selectedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setSelectedFiles([]);

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);

      // Manejar errores específicos
      if (error.message === 'SESSION_EXPIRED') {
        setUploadError('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
      } else if (error.message === 'NO_AUTH') {
        setUploadError('No estás autenticado. Por favor inicia sesión.');
      } else if (error.message.includes('Tipo de archivo')) {
        setUploadError('Solo se permiten imágenes (JPG, PNG, GIF, WEBP), PDFs y videos (MP4, MOV, WEBM, AVI, MKV)');
      } else if (error.message.includes('tamaño') || error.message.includes('grande')) {
        setUploadError('Archivo demasiado grande. Máximo 200MB para videos, 10MB para imágenes/PDFs');
      } else if (error.message.includes('máximo')) {
        setUploadError('Se excedió el límite máximo de archivos permitidos');
      } else {
        setUploadError(error.message || 'Error al subir archivos. Por favor intenta nuevamente.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="evidence-upload">
      <div className="evidence-upload-header">
        <Upload size={20} />
        <h4>Subir Evidencias</h4>
      </div>

      <p className="evidence-hint">
        Sube imágenes, PDFs o videos del trabajo (máx. 10 archivos · imágenes/PDFs: 10MB · videos: 200MB)
      </p>

      {/* Zona de selección de archivos */}
      <div
        className="evidence-dropzone"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={32} />
        <p>Click para seleccionar archivos</p>
        <span className="dropzone-hint">Imágenes (JPG, PNG, WEBP), PDFs o Videos (MP4, MOV, WEBM)</span>
      </div>

      {/* Captura directa desde la cámara */}
      <button
        type="button"
        className="evidence-camera-btn"
        onClick={() => setCameraOpen(true)}
      >
        <Camera size={18} />
        Tomar foto o grabar video
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <CameraCapture
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Vista previa de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="evidence-preview-list">
          {selectedFiles.map((fileObj, index) => (
            <div key={index} className="evidence-preview-item">
              {fileObj.type === 'IMAGE' ? (
                <img
                  src={fileObj.preview}
                  alt="Preview"
                  className="evidence-preview-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex');
                  }}
                />
              ) : fileObj.type === 'VIDEO' ? (
                <div className="evidence-preview-video">
                  <video
                    src={fileObj.preview}
                    className="evidence-preview-video-el"
                    muted
                    preload="metadata"
                  />
                  <div className="evidence-preview-video-overlay">
                    <Video size={20} />
                  </div>
                </div>
              ) : (
                <div className="evidence-preview-pdf">
                  <FileText size={32} />
                  <span>{fileObj.file.name}</span>
                </div>
              )}
              <button
                onClick={() => removeFile(index)}
                className="evidence-remove-btn"
                title="Eliminar"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadError && (
        <div className="evidence-error">
          {uploadError}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="evidence-upload-btn"
        >
          {isUploading ? (
            <>
              <Loader2 size={18} className="spinning" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload size={18} />
              Subir {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''}
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default EvidenceUpload;
