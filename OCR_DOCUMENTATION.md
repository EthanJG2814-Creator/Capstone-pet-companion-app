  # OCR / Camera Documentation

  This document describes the OCR-related camera feature and the changes made so the camera works correctly in the medication flow.

  ---

  ## Purpose

  The app uses the device camera to **capture prescription or medication labels**. Users can take a photo of a label and then continue to the **Medication Review** screen to enter or edit medication details. The camera is used for label capture; OCR text extraction can be added later if needed.

  ---

  ## Where It Lives

  - **Screen:** `src/screens/medication/MedicationLabelCaptureScreen.tsx`
  - **Navigation:** Reached from the medication stack; after capture, the user is sent to **Medication Review** with the image URI and optional raw OCR/parsed data.

  ---

  ## Dependencies

  - **expo-camera** `~17.0.10` — Required for Expo SDK 54. The camera UI and permissions are implemented with this package.

  ---

  ## Changes Made So the OCR Camera Works

  ### 1. **expo-camera version (Expo SDK 54)**

  - **expo-camera** is set to `~17.0.10` in `package.json` so it matches Expo SDK 54 and avoids compatibility issues with the camera API.

  ### 2. **Use the new expo-camera API (CameraView + useCameraPermissions)**

  - **Before:** The code used the older `Camera` component and `CameraType` (e.g. `CameraType.back`).
  - **After:**
    - **CameraView** is used instead of `Camera` (current API in expo-camera v17).
    - **useCameraPermissions()** is used instead of the legacy permission APIs.
    - The ref type is `CameraView` so `takePictureAsync` is called on the correct object.

  This avoids deprecated APIs and ensures the camera starts and captures correctly on SDK 54.

  ### 3. **Use string literal for camera facing**

  - **Before:** `facing={CameraType.back}` could be undefined or not match what expo-camera expects in v17.
  - **After:** The prop is set as `facing="back"` (string literal) on `CameraView`.

  This guarantees the back camera is requested without relying on `CameraType.back`, so the camera does not fail due to an undefined or incorrect facing value.

  ### 4. **App configuration (app.json)**

  - The **expo-camera** plugin is added under `app.json` → `expo.plugins` with a **cameraPermission** message so that:
    - iOS and Android show the correct system prompt when requesting camera access.
    - The app is configured for camera usage at build time (required for native builds).

  Example:

  ```json
  "plugins": [
    [
      "expo-camera",
      {
        "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera to scan prescription labels."
      }
    ]
  ]
  ```

  ---

  ## User Flow

  1. User opens **Medication Label Capture** (camera screen).
  2. App checks camera permission via **useCameraPermissions()**; if not granted, it shows a “Grant permission” UI.
  3. Once granted, the **CameraView** is shown with `facing="back"` and an overlay instructing the user to align the label.
  4. User taps the capture button; **takePictureAsync** runs on the `CameraView` ref (quality 0.6, skipProcessing true).
  5. Captured image is shown in a preview with **Retake** and **Use photo**.
  6. **Use photo** navigates to **MedicationReview** with:
    - `imageUri`: captured photo URI  
    - `rawOcrText`: optional (e.g. empty for now)  
    - `parsedData`: optional  
    - `editMode`: false  
    - `existingMedication`: undefined  

  ---

  ## Summary

  - **expo-camera** is on `~17.0.10` for SDK 54.
  - The screen uses **CameraView** and **useCameraPermissions** (new API).
  - **facing="back"** is set as a string to avoid `CameraType.back` issues.
  - **app.json** includes the **expo-camera** plugin with **cameraPermission** so the OCR camera has the right permissions and configuration.

  These changes ensure the OCR camera works for medication label capture and that the app is ready for future OCR or parsing improvements on the same image.
