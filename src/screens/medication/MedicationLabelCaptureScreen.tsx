import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StackScreenProps } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { MedicationStackParamList, ParsedMedicationData } from '../../types';

type Props = StackScreenProps<MedicationStackParamList, 'MedicationLabelCapture'>;

/** If OCR/recognition is added later, run it here and return parsedData. On any failure return undefined so user can still fill manually. */
function tryParseLabel(_imageUri: string): ParsedMedicationData | undefined {
  try {
    // Placeholder for future OCR; on failure return undefined so flow continues with manual entry
    return undefined;
  } catch {
    return undefined;
  }
}

export const MedicationLabelCaptureScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        skipProcessing: true,
      });
      if (photo?.uri) setPhotoUri(photo.uri);
    } catch (error) {
      Alert.alert('Camera error', 'Unable to capture image. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  const handleUsePhoto = () => {
    const uri = photoUri ?? '';
    let parsedData: ParsedMedicationData | undefined;
    try {
      parsedData = uri ? tryParseLabel(uri) : undefined;
    } catch {
      parsedData = undefined;
    }
    navigation.navigate('MedicationReview', {
      imageUri: uri,
      rawOcrText: '',
      parsedData,
      editMode: false,
      existingMedication: undefined,
    });
  };

  if (!permission) {
    return <LoadingSpinner message="Checking camera permissions..." />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to scan prescription labels.
          </Text>
          <Button title="Grant permission" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  if (photoUri) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <Text style={styles.helperText}>
            Review the captured label. You can retake the photo or continue and fill in details manually.
          </Text>
          <View style={styles.actionsRow}>
            <Button title="Retake" onPress={handleRetake} variant="secondary" style={styles.actionButton} />
            <Button title="Continue to enter details" onPress={handleUsePhoto} style={styles.actionButton} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.cameraWrapper}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>Align the label</Text>
            <Text style={styles.overlaySubtitle}>
              Make sure the entire prescription label is visible, then tap the button below to capture.
            </Text>
          </View>
        </View>
        <View style={styles.captureSection}>
          <TouchableOpacity
            onPress={handleTakePhoto}
            activeOpacity={0.7}
            style={styles.captureButton}
            disabled={capturing}
          >
            <View style={[styles.captureOuter, capturing && styles.captureOuterDisabled]}>
              <View style={styles.captureInner}>
                <MaterialIcons name="camera-alt" size={36} color={COLORS.primary} />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.captureLabel}>Tap to capture</Text>
          <Text style={styles.footerHint}>You can edit or enter details manually after capturing.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 24,
  },
  cameraWrapper: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#000',
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  overlay: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 16,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  overlaySubtitle: {
    fontSize: 14,
    color: '#ddd',
  },
  captureSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    marginBottom: 8,
  },
  captureOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureOuterDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  footerHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
});

