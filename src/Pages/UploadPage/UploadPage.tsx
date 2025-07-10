import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import './Styles.css';

interface FileInfo {
  file: File;
  id: string;
  size: string;
  type: string;
}

const UploadPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: FileInfo[] = Array.from(files).map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        size: formatFileSize(file.size),
        type: file.type || 'Unknown'
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files) {
      const newFiles: FileInfo[] = Array.from(files).map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        size: formatFileSize(file.size),
        type: file.type || 'Unknown'
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }
    
    // Here you would typically send the files to your backend
    console.log('Uploading files:', selectedFiles);
    alert(`Uploading ${selectedFiles.length} file(s)...`);
    
    // For demo purposes, you can add your actual upload logic here
    // Example: send files to your API endpoint
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1 className="upload-title">File Upload</h1>
        
        <div 
          className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadClick}
        >
          <div className="upload-icon">
            <span className="favicon-upload">⬆</span>
          </div>
          <p className="upload-text">
            Drag and drop files here, or <span className="click-here">click to browse</span>
          </p>
          <p className="upload-hint">Supports all file types</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="file-input"
          accept="*/*"
        />

        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h3 className="files-title">Selected Files ({selectedFiles.length})</h3>
            <div className="files-list">
              {selectedFiles.map((fileInfo) => (
                <div key={fileInfo.id} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      <span className="favicon-file">📋</span>
                    </div>
                    <div className="file-details">
                      <p className="file-name">{fileInfo.file.name}</p>
                      <p className="file-meta">{fileInfo.size} • {fileInfo.type}</p>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFile(fileInfo.id)}
                    title="Remove file"
                  >
                    <span className="favicon-remove">×</span>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="upload-actions">
              <button 
                className="upload-btn"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0}
              >
                Upload Files
              </button>
              <button 
                className="clear-btn"
                onClick={() => setSelectedFiles([])}
                disabled={selectedFiles.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
