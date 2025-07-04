import { useRef, useState } from 'react';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFileUpload } from '@/hooks/useFileUpload';

interface FileUploaderProps {
  onUploadComplete?: (fileInfo: any) => void;
  maxFiles?: number;
  folder?: string;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  maxFiles = 5,
  folder = 'general',
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxSizeMB = 10,
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, progress } = useFileUpload();

  const handleFileSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    fileArray.forEach(async (file) => {
      const result = await uploadFile(file, {
        folder,
        allowedTypes: acceptedFileTypes,
        maxSizeMB
      });

      if (result) {
        const fileInfo = { ...result, originalFile: file };
        setUploadedFiles(prev => [...prev, fileInfo]);
        onUploadComplete?.(fileInfo);
      }
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isImageFile = (type: string) => type.startsWith('image/');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag and drop files here, or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary underline hover:no-underline"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          Max {maxFiles} files, {maxSizeMB}MB each. Supports: {acceptedFileTypes.join(', ')}
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes.join(',')}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {isImageFile(file.type) ? (
                    <div className="relative">
                      <img
                        src={file.publicUrl}
                        alt={file.fileName}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-background rounded flex items-center justify-center">
                      <File className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium truncate max-w-48">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;