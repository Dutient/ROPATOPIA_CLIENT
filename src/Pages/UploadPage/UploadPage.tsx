import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import './Styles.css';
import type { FileInfo } from '../../Models/IFileInfo';
import Breadcrumb from '../../Components/Breadcrumb';
import { IngestionRepository } from '../../Repositories/IngestionRepository';
import { useNavigate } from 'react-router-dom';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [batchId, setBatchId] = useState("");

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
      setSelectedFile(newFile);
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
      setSelectedFile(newFile);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
  };

  const handleSheetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSheetName(e.target.value);
  };

  const handleUpload = async () => {
    if (!companyName.trim()) {
      alert('Please enter the company name.');
      return;
    }
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }
    
    // Call IngestionRepository.ingestFile for the selected file
    try {
      const response = await IngestionRepository.ingestFile(selectedFile.file, companyName, sheetName);
      if (response.ok) {
        setUploadSuccess(true);
        const result = await response.json();
        setBatchId(result.batch_id);
        alert('Upload successful!');
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Ingestion error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="upload-page">
      <Breadcrumb paths={[
        { name: 'Home', href: '/' },
        { name: 'Upload', href: '/upload' }
      ]} />
      <div className="upload-container">
        <h1 className="upload-title">File Upload</h1>

        {/* Company Name Field */}
        <div className="input-group">
          <label htmlFor="companyName" className="input-label">Company Name <span className="required-asterisk" title="Required">*</span></label>
          <input
            id="companyName"
            type="text"
            className="input-field"
            value={companyName}
            onChange={handleCompanyNameChange}
            placeholder="Enter company name"
            autoComplete="off"
            required
          />
        </div>

        {/* Sheet Name Field (Numbers Only) */}
        <div className="input-group">
          <label htmlFor="sheetName" className="input-label">Sheet Name</label>
          <input
            id="sheetName"
            type="text"
            className="input-field"
            value={sheetName}
            onChange={handleSheetNameChange}
            placeholder="Enter sheet number"
            autoComplete="off"
          />
        </div>
        
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
            <span>File <span className="required-asterisk" title="Required">*</span></span><br/>
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

        {selectedFile && (
          <div className="selected-files">
            <h3 className="files-title">Selected File</h3>
            <div className="files-list">
              <div className="file-item">
                <div className="file-info">
                  <div className="file-icon">
                    <span className="favicon-file">📋</span>
                  </div>
                  <div className="file-details">
                    <p className="file-name">{selectedFile.file.name}</p>
                    <p className="file-meta">{selectedFile.size} • {selectedFile.type}</p>
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={removeFile}
                  title="Remove file"
                >
                  <span className="favicon-remove">×</span>
                </button>
              </div>
            </div>
            
            <div className="upload-actions">
              <button 
                className="upload-btn"
                onClick={handleUpload}
              >
                Upload File
              </button>
              <button 
                className="clear-btn"
                onClick={removeFile}
              >
                Clear
              </button>
              {uploadSuccess && (
                <button 
                  className="next-btn"
                  onClick={() => {
                    navigate(`/activity?batch_id=${encodeURIComponent(batchId)}`);
                  }}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
