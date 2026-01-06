"use client";

import { Button } from "@/components/ui/button";
import imageCompression from "browser-image-compression";
import * as faceapi from "face-api.js";
import { Camera, Image as ImageIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import StepWrapper from "./StepWrapper";

interface PhotoStepProps {
  data: {
    photo: File | null;
  };
  updateData: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function PhotoStep({
  data,
  updateData,
  onBack,
  onNext,
}: PhotoStepProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load face-api.js models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face detection models:", err);
        // Continue without face detection if models fail to load
        setModelsLoaded(true);
      }
    };
    loadModels();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (10MB max before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError("Photo must be less than 10MB");
      return;
    }

    setError("");
    setIsValidating(true);

    // Create preview URL - must be cleaned up in all code paths
    const previewUrl = URL.createObjectURL(file);

    try {
      // Step 1: Load image for face detection
      const img = new Image();
      img.src = previewUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Step 2: Detect face (if models are loaded)
      if (modelsLoaded) {
        const detections = await faceapi
          .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections.length === 0) {
          setError(
            "No face detected. Please upload a clear photo showing your face."
          );
          setIsValidating(false);
          URL.revokeObjectURL(previewUrl);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        if (detections.length > 1) {
          setError(
            "Multiple faces detected. Please upload a photo with only you in it."
          );
          setIsValidating(false);
          URL.revokeObjectURL(previewUrl);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }
      }

      // Step 3: Compress image
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type as any,
      };

      const compressedFile = await imageCompression(file, compressionOptions);

      // Step 4: Create final preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsValidating(false);
      };
      reader.readAsDataURL(compressedFile);

      // Update data with compressed file
      updateData({ photo: compressedFile });
      URL.revokeObjectURL(previewUrl);
    } catch (err) {
      console.error("Photo validation error:", err);
      setError("Failed to process photo. Please try again.");
      setIsValidating(false);
      URL.revokeObjectURL(previewUrl); // Clean up blob URL on error
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    updateData({ photo: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleNext = () => {
    if (!data.photo) {
      setError("Please upload a photo");
      return;
    }

    onNext();
  };

  return (
    <StepWrapper
      title="Add your photo"
      description="Upload a clear photo of your face"
    >
      <div className="space-y-6">
        {/* Mobile-style Upload Area */}
        <div
          className="relative w-full aspect-[3/4] max-w-sm mx-auto bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:bg-gray-50 group"
          onClick={isValidating ? undefined : triggerFileInput}
          style={{ cursor: isValidating ? "wait" : "pointer" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {isValidating ? (
            <div className="text-center p-6 space-y-4 max-w-sm mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 animate-pulse">
                <Camera size={40} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Analyzing photo...
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Detecting face and optimizing
                </p>
              </div>
              <div className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                <span className="animate-spin mr-2">⚙️</span>
                Processing
              </div>
            </div>
          ) : preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePhoto();
                }}
                className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all active:scale-95"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
                  Tap to change
                </span>
              </div>
            </>
          ) : (
            <div className="text-center p-6 space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                <Camera size={40} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload Photo
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tap to select from library
                </p>
              </div>
              <div className="inline-flex items-center text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                <ImageIcon size={12} className="mr-1.5" />
                JPG, PNG up to 5MB
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-center text-red-600 font-medium bg-red-50 py-2 rounded-lg max-w-sm mx-auto">
            {error}
          </p>
        )}

        {/* Guidelines - Mobile Card Style */}
        <div className="bg-white border rounded-xl p-4 space-y-3 max-w-sm mx-auto">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            📋 Photo Guidelines
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span> <span>Clear face</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span> <span>Solo photo</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>{" "}
              <span>Recent photo</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>{" "}
              <span>Good lighting</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-500">✕</span> <span>No filters</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-500">✕</span> <span>No groups</span>
            </div>
          </div>
          {/* <p className="text-xs text-gray-500 border-t pt-2 mt-2">
            ✨ We automatically detect faces and optimize image quality
          </p> */}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isValidating}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          size="lg"
          className="flex-[2]"
          disabled={isValidating || !data.photo}
        >
          {isValidating ? "Validating..." : "Next"}
        </Button>
      </div>
    </StepWrapper>
  );
}
