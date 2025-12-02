import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="group relative w-full h-80 border-2 border-dashed border-charcoal-300 rounded-3xl flex flex-col items-center justify-center bg-white/50 hover:bg-white/80 transition-all duration-300 cursor-pointer hover:border-charcoal-500 hover:shadow-lg backdrop-blur-sm"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      
      <div className="p-4 bg-charcoal-50 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
        <Upload className="w-8 h-8 text-charcoal-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-charcoal-800 mb-2 font-handwriting text-3xl">
        Upload your photo
      </h3>
      <p className="text-charcoal-500 text-sm text-center max-w-xs">
        Click to browse or drag and drop<br/>
        JPG, PNG or WebP
      </p>
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ImageIcon className="w-5 h-5 text-charcoal-400" />
      </div>
    </div>
  );
};