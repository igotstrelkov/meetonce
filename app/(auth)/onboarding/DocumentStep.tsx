"use client";

import { Button } from "@/components/ui/button";
import imageCompression from "browser-image-compression";
import { FileText, Image as ImageIcon, X } from "lucide-react";
import { useRef, useState } from "react";
import StepWrapper from "./StepWrapper";

interface DocumentStepProps {
  data: {
    verificationDoc: File | null;
  };
  updateData: (data: any) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function DocumentStep({
  data,
  updateData,
  onBack,
  onSubmit,
}: DocumentStepProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError("Document must be less than 10MB");
      return;
    }

    setError("");
    setIsProcessing(true);

    try {
      // Compress image
      const compressionOptions = {
        maxSizeMB: 2,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        fileType: file.type as any,
      };

      const compressedFile = await imageCompression(file, compressionOptions);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsProcessing(false);
      };
      reader.readAsDataURL(compressedFile);

      // Update data with compressed file
      updateData({ verificationDoc: compressedFile });
    } catch (err) {
      console.error("Document processing error:", err);
      setError("Failed to process document. Please try again.");
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveDocument = () => {
    setPreview(null);
    updateData({ verificationDoc: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!data.verificationDoc) {
      setError("Please upload a verification document");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      setError("Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <StepWrapper
      title="Verify your identity"
      description="Upload a photo of your ID (passport, driver's license, or national ID)"
    >
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          className="relative w-full aspect-[3/2] max-w-sm mx-auto bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:bg-gray-50 group"
          onClick={isProcessing ? undefined : triggerFileInput}
          style={{ cursor: isProcessing ? "wait" : "pointer" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {isProcessing ? (
            <div className="text-center p-6 space-y-4 max-w-sm mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 animate-pulse">
                <FileText size={40} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Processing document...
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Optimizing image quality
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
                alt="Document preview"
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveDocument();
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
                <FileText size={40} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload Document
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tap to select from library
                </p>
              </div>
              <div className="inline-flex items-center text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                <ImageIcon size={12} className="mr-1.5" />
                JPG, PNG up to 10MB
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-center text-red-600 font-medium bg-red-50 py-2 rounded-lg max-w-sm mx-auto">
            {error}
          </p>
        )}

        {/* Guidelines */}
        <div className="bg-white border rounded-xl p-4 space-y-3 max-w-sm mx-auto">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            📋 Document Guidelines
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>{" "}
              <span>Clear & readable</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>{" "}
              <span>Full document</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span> <span>Not expired</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>{" "}
              <span>Good lighting</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-500">✕</span> <span>No blur</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-500">✕</span> <span>No glare</span>
            </div>
          </div>
          {/* <p className="text-xs text-gray-500 border-t pt-2 mt-2">
            🔒 Your ID is kept private and used only for verification
          </p> */}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={isSubmitting || isProcessing}
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          size="lg"
          className="flex-[2]"
          disabled={isSubmitting || isProcessing || !data.verificationDoc}
        >
          {isSubmitting
            ? "Submitting..."
            : isProcessing
              ? "Processing..."
              : "Complete Profile"}
        </Button>
      </div>
    </StepWrapper>
  );
}
