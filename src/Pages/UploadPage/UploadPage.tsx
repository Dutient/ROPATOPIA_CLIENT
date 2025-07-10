import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import './Styles.css';
import type { FileInfo } from '../../Models/IFileInfo';
import Breadcrumb from '../../Components/Breadcrumb';
import { IngestionRepository } from '../../Repositories/IngestionRepository';

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

  const isValidFileType = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    const allowedExtensions = ['.pdf', '.xlsx', '.csv'];
    const fileName = file.name.toLowerCase();
    return (
      allowedTypes.includes(file.type) ||
      allowedExtensions.some(ext => fileName.endsWith(ext))
    );
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!isValidFileType(file)) {
        alert('Only PDF, XLSX, and CSV files are allowed.');
        return;
      }
      const newFile: FileInfo = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        size: formatFileSize(file.size),
        type: file.type || 'Unknown'
      };
      setSelectedFiles([newFile]);
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
    if (files && files.length > 0) {
      const file = files[0];
      if (!isValidFileType(file)) {
        alert('Only PDF, XLSX, and CSV files are allowed.');
        return;
      }
      const newFile: FileInfo = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        size: formatFileSize(file.size),
        type: file.type || 'Unknown'
      };
      setSelectedFiles([newFile]);
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
    
    // Call IngestionRepository.ingestFile for each selected file
    selectedFiles.forEach(async (fileInfo) => {
      try {
        const result = await IngestionRepository.ingestFile(fileInfo.file);
        console.log('Ingestion result:', result);
        // Optionally, show a success/failure message to the user
      } catch (error) {
        console.error('Ingestion error:', error);
        // Optionally, show an error message to the user
      }
    });
  };

  return (
    <div className="upload-page">
      <Breadcrumb paths={[
        { name: 'Home', href: '/' },
        { name: 'Upload', href: '/upload' }
      ]} />
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
          <p className="upload-hint">Supports xlsx/csv/pdf files</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="file-input"
          accept=".pdf,.xlsx,.csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
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
