import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Loader2, Trash2 } from 'lucide-react';
import { serviceService } from '../../api/service.service';
import './EvidenceUpload.css';

function EvidenceUpload({ serviceId, onUploadSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validar que no sean más de 10 archivos en total
    if (selectedFiles.length + files.length > 10) {
      setUploadError('Máximo 10 archivos permitidos');
      return;
    }

    // Validar tipo y tamaño de archivos
    const validFiles = [];
    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';

      if (!isImage && !isPDF) {
        setUploadError('Solo se permiten imágenes y PDFs');
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Cada archivo debe pesar máximo 10MB');
        continue;
      }

      validFiles.push({
        file,
        preview: isImage ? URL.createObjectURL(file) : null,
        type: isImage ? 'IMAGE' : 'PDF'
      });
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
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
        setUploadError('Solo se permiten imágenes (JPG, PNG, GIF, WEBP) y archivos PDF');
      } else if (error.message.includes('tamaño')) {
        setUploadError('Uno o más archivos exceden el tamaño máximo de 10MB');
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
        Sube imágenes o PDFs del trabajo realizado (máximo 10 archivos, 10MB cada uno)
      </p>

      {/* Zona de selección de archivos */}
      <div
        className="evidence-dropzone"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={32} />
        <p>Click para seleccionar archivos</p>
        <span className="dropzone-hint">Imágenes (JPG, PNG, GIF, WEBP) o PDFs</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Vista previa de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="evidence-preview-list">
          {selectedFiles.map((fileObj, index) => (
            <div key={index} className="evidence-preview-item">
              {fileObj.type === 'IMAGE' ? (
                <img src={fileObj.preview} alt="Preview" className="evidence-preview-img" />
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
