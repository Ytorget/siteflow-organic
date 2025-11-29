import React, { useCallback, useState } from 'react';
import { useDropzone, Accept, FileRejection } from 'react-dropzone';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from './progress';

interface FileUploadProps {
  onUpload: (files: File[]) => void | Promise<void>;
  accept?: Accept;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUpload = ({
  onUpload,
  accept,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = true,
  className = '',
  disabled = false,
}: FileUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setErrors([]);

      // Handle rejected files
      const rejectionErrors = rejectedFiles.map((rejection) => {
        const error = rejection.errors[0];
        if (error.code === 'file-too-large') {
          return `${rejection.file.name} är för stor (max ${formatFileSize(maxSize)})`;
        }
        if (error.code === 'file-invalid-type') {
          return `${rejection.file.name} har en ogiltig filtyp`;
        }
        return `${rejection.file.name}: ${error.message}`;
      });

      if (rejectionErrors.length > 0) {
        setErrors(rejectionErrors);
      }

      if (acceptedFiles.length === 0) return;

      // Add files to state with uploading status
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload progress (replace with real upload logic)
      for (let i = 0; i < acceptedFiles.length; i++) {
        const fileIndex = files.length + i;

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === fileIndex ? { ...f, progress } : f
            )
          );
        }

        // Mark as success
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === fileIndex ? { ...f, status: 'success' as const } : f
          )
        );
      }

      // Call the upload handler
      try {
        await onUpload(acceptedFiles);
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            newFiles.some((nf) => nf.file === f.file)
              ? { ...f, status: 'error' as const, error: 'Uppladdningen misslyckades' }
              : f
          )
        );
      }
    },
    [files.length, maxSize, onUpload]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
    disabled,
  });

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
            : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-100">
          {isDragActive ? 'Släpp filerna här' : 'Dra och släpp filer här'}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          eller klicka för att välja filer
        </p>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Max {formatFileSize(maxSize)} per fil
          {maxFiles > 1 && `, upp till ${maxFiles} filer`}
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((uploadedFile, index) => (
            <li
              key={index}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <File className="h-8 w-8 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
                {uploadedFile.status === 'uploading' && (
                  <Progress value={uploadedFile.progress} size="sm" className="mt-2" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {uploadedFile.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {uploadedFile.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { FileUpload };
