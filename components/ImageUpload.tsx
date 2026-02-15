'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  onRemove?: () => void;
}

export default function ImageUpload({ onUpload, currentImage, onRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize to max 1200px width while maintaining aspect ratio
          const maxWidth = 1200;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to blob with 80% quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check original file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }

      setUploading(true);

      // Compress image
      const compressedBlob = await compressImage(file);
      
      // Check compressed size (should be under 500KB after compression)
      console.log(`Original: ${(file.size / 1024).toFixed(2)}KB, Compressed: ${(compressedBlob.size / 1024).toFixed(2)}KB`);

      // Generate unique filename
      const fileExt = 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setPreview(publicUrl);
      onUpload(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onRemove) onRemove();
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center py-6">
            {uploading ? (
              <>
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-gray-600">Compressing & uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 font-semibold">Click to upload image</p>
                <p className="text-xs text-gray-500 mt-1">Auto-compressed to save space</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
