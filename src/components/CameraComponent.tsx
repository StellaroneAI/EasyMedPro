import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

interface CameraComponentProps {
  onPhotoTaken?: (uri: string) => void;
  onCancel?: () => void;
  uploadEndpoint?: string;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onPhotoTaken,
  onCancel,
  uploadEndpoint = '/api/upload'
}) => {
  const cameraRef = useRef<Camera>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const camPerm = await Camera.requestCameraPermissionsAsync();
      const mediaPerm = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(camPerm.status === 'granted');
      setHasMediaPermission(mediaPerm.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      if (hasMediaPermission) {
        await MediaLibrary.createAssetAsync(photo.uri);
      }
    }
  };

  const uploadPhoto = async () => {
    if (!photoUri) return;
    setIsUploading(true);
    try {
      const fileInfo = await FileSystem.getInfoAsync(photoUri);
      const fileName = fileInfo.uri.split('/').pop() || 'photo.jpg';
      const form = new FormData();
      form.append('file', {
        uri: photoUri,
        name: fileName,
        type: 'image/jpeg'
      } as any);

      await fetch(uploadEndpoint, {
        method: 'POST',
        body: form
      });

      onPhotoTaken && onPhotoTaken(photoUri);
      setPhotoUri(null);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (hasCameraPermission === null) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => setPhotoUri(null)}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={uploadPhoto}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Upload</Text>
              )}
            </TouchableOpacity>
            {onCancel && (
              <TouchableOpacity style={styles.button} onPress={onCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <>
          <Camera ref={cameraRef} style={styles.camera} type={CameraType.back} />
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Text style={styles.buttonText}>Capture</Text>
          </TouchableOpacity>
          {onCancel && (
            <TouchableOpacity style={styles.cancelOverlay} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  preview: { flex: 1 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#000'
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    marginHorizontal: 4
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  captureButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#2563eb',
    padding: 20,
    borderRadius: 50
  },
  cancelOverlay: {
    position: 'absolute',
    top: 32,
    right: 16,
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 8
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default CameraComponent;
