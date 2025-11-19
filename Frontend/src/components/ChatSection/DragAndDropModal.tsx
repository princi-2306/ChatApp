import React, { useState, useRef, useCallback } from "react";
import { X, Upload, Image, File, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DragAndDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadType: "image" | "file";
  onFilesSelected: (files: File[]) => void;
}

const DragAndDropModal: React.FC<DragAndDropModalProps> = ({
  isOpen,
  onClose,
  uploadType,
  onFilesSelected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = uploadType === "image" ? "image/*" : "*";
  const IconComponent = uploadType === "image" ? Image : File;
  const title = uploadType === "image" ? "Upload Images" : "Upload Files";

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (uploadType === "image") {
        const imageFiles = files.filter((file) =>
          file.type.startsWith("image/")
        );
        setSelectedFiles((prev) => [...prev, ...imageFiles]);
      } else {
        setSelectedFiles((prev) => [...prev, ...files]);
      }
    },
    [uploadType]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
      setSelectedFiles([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-[#2a2a2a] rounded-md transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-[#3a3a3a] bg-[#252525]"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className={`p-4 rounded-full transition-colors ${
                  uploadType === "image"
                    ? "bg-blue-500/20"
                    : "bg-purple-500/20"
                }`}
              >
                <IconComponent
                  className={`h-12 w-12 ${
                    uploadType === "image" ? "text-blue-500" : "text-purple-500"
                  }`}
                />
              </div>
              <div>
                <p className="text-white font-medium mb-1">
                  Drag and drop {uploadType === "image" ? "images" : "files"}{" "}
                  here
                </p>
                <p className="text-gray-400 text-sm">or</p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className={`${
                  uploadType === "image"
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-purple-500 hover:bg-purple-600"
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select {uploadType === "image" ? "Images" : "Files"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes}
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-3">
                Selected {selectedFiles.length}{" "}
                {selectedFiles.length === 1 ? "file" : "files"}
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-[#252525] rounded-lg border border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors"
                  >
                    {file.type.startsWith("image/") ? (
                      <div className="relative h-10 w-10 rounded overflow-hidden bg-[#1e1e1e] flex-shrink-0">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <File className="h-5 w-5 text-purple-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-[#3a3a3a] rounded transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[#2a2a2a]">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedFiles.length === 0}
            className={`${
              uploadType === "image"
                ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                : "bg-purple-500 hover:bg-purple-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Check className="h-4 w-4 mr-2" />
            Send {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DragAndDropModal;