import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import './Styles.css';
import type { FileInfo } from '../../Models/IFileInfo';
import { IngestionRepository } from '../../Repositories/IngestionRepository';
import Spinner from '../Spinner/Spinner';
import type { IUploadPopupProps } from './IUploadPopupProps';

const UploadPopup: React.FC<IUploadPopupProps> = ({ 
  onUploadClick,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [companyName, setCompanyName] = useState(""); 
  const [sheetName, setSheetName] = useState("");   
  const [template, setTemplate] = useState("a");

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

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTemplate(e.target.value);
  };

  const handleUpload = async () => {
    if (!companyName.trim()) {
      alert('Please enter a company name.');
      return;
    }

    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile.file);
      formData.append('companyName', companyName);
      formData.append('sheetName', sheetName);
      formData.append('template', template);

      // Upload file
      const response = await IngestionRepository.ingestFile(selectedFile.file, companyName, sheetName, template);
      
      if (response.ok) {
        const result = await response.json();
        setUploadSuccess(true);        
        onUploadClick(result.batch_id, companyName);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCompanyName("");
    setSheetName("");
    setTemplate("a");
    setUploadSuccess(false);
  };

  return (
    <div className="upload-popup-content">
          {uploadSuccess ? (
            <div className="upload-success">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              <h3>Upload Successful!</h3>
              <p>Your session has been created successfully.</p>
            </div>
          ) : (
            <>
              <div className="input-group">
                <label className="input-label">
                  Company Name <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter company name..."
                  value={companyName}
                  onChange={handleCompanyNameChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Sheet Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter sheet name..."
                  value={sheetName}
                  onChange={handleSheetNameChange}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Template</label>
                <select
                  className="input-field"
                  value={template}
                  onChange={handleTemplateChange}
                >
                  <option value="a">Template A</option>
                  <option value="b">Template B</option>
                </select>
              </div>

              <div 
                className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <div className="upload-icon">
                  <span className="favicon-upload">📁</span>
                </div>
                <div className="upload-text">
                  {selectedFile ? 'File selected' : 'Drag and drop your file here'}
                </div>
                {!selectedFile && (
                  <div className="click-here">or click here to browse</div>
                )}
                <div className="upload-hint">
                  Supports PDF, XLSX, and CSV files
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-input"
                  onChange={handleFileSelect}
                  accept=".pdf,.xlsx,.csv"
                />
              </div>

              {selectedFile && (
                <div className="selected-files">
                  <h4 className="files-title">Selected File</h4>
                  <div className="files-list">
                    <div className="file-item">
                      <div className="file-info">
                        <span className="file-icon">📄</span>
                        <div className="file-details">
                          <div className="file-name">{selectedFile.file.name}</div>
                          <div className="file-meta">
                            {selectedFile.size} • {selectedFile.type}
                          </div>
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
                </div>
              )}

              <div className="upload-actions">
                <button
                  className="upload-btn"
                  onClick={handleUpload}
                  disabled={!selectedFile || !companyName.trim() || isSubmitting}
                >
                  {isSubmitting ? <Spinner /> : 'Upload'}
                </button>
                <button
                  className="clear-btn"
                  onClick={resetForm}
                  disabled={!selectedFile && !companyName.trim()}
                >
                  Clear
                </button>
              </div>
            </>
          )}
        </div>
  );
};

export default UploadPopup;
