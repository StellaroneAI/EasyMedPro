/**
 * Camera Component for Prescription and Document Scanning
 * Mobile-optimized camera interface for health document capture
 */

import React, { useState } from 'react';
import { Camera, ImageIcon, Upload, X, Check } from 'lucide-react';
import { useCamera } from '../hooks/useMobile';

interface CameraComponentProps {
  onPhotoTaken?: (photo: any) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onPhotoTaken,
  onCancel,
  title = "Capture Document",
  description = "Take a photo of your prescription, medical document, or insurance card",
  className = ""
}) => {
  const { takePicture, selectFromGallery, isLoading, lastPhoto, clearLastPhoto } = useCamera();
  const [previewMode, setPreviewMode] = useState(false);

  const handleTakePicture = async () => {
    try {
      const photo = await takePicture();
      if (photo) {
        setPreviewMode(true);
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      alert('Failed to access camera. Please check permissions.');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const photo = await selectFromGallery();
      if (photo) {
        setPreviewMode(true);
      }
    } catch (error) {
      console.error('Failed to select from gallery:', error);
      alert('Failed to access gallery. Please check permissions.');
    }
  };

  const handleConfirmPhoto = () => {
    if (lastPhoto && onPhotoTaken) {
      onPhotoTaken(lastPhoto);
    }
    setPreviewMode(false);
    clearLastPhoto();
  };

  const handleRetakePhoto = () => {
    setPreviewMode(false);
    clearLastPhoto();
  };

  const handleCancel = () => {
    setPreviewMode(false);
    clearLastPhoto();
    if (onCancel) {
      onCancel();
    }
  };

  if (previewMode && lastPhoto) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Review Photo</h3>
          <p className="text-sm text-gray-600">Review and confirm your captured image</p>
        </div>

        <div className="mb-6">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {lastPhoto.dataUrl && (
              <img
                src={lastPhoto.dataUrl}
                alt="Captured document"
                className="w-full h-64 object-cover"
              />
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleRetakePhoto}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Retake
          </button>
          <button
            onClick={handleConfirmPhoto}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm
          </button>
        </div>

        <button
          onClick={handleCancel}
          className="w-full mt-2 flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleTakePicture}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-5 h-5 mr-3" />
          {isLoading ? 'Opening Camera...' : 'Take Photo'}
        </button>

        <button
          onClick={handleSelectFromGallery}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-5 h-5 mr-3" />
          {isLoading ? 'Opening Gallery...' : 'Choose from Gallery'}
        </button>
      </div>

      {onCancel && (
        <button
          onClick={handleCancel}
          className="w-full mt-4 flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Ensure good lighting</li>
          <li>• Keep the document flat and fully visible</li>
          <li>• Avoid shadows and reflections</li>
          <li>• Make sure text is clear and readable</li>
        </ul>
      </div>
    </div>
  );
};

export default CameraComponent;