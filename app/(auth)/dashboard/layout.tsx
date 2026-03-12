"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import imageCompression from "browser-image-compression";
import { useMutation, useQuery } from "convex/react";
import { FileText, Shield, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    // If still loading, wait
    if (currentUser === undefined) return;

    // If user doesn't exist in Convex, redirect to onboarding
    if (currentUser === null) {
      router.push("/onboarding");
      return;
    }
  }, [currentUser, router]);

  if (currentUser === undefined || currentUser === null) {
    return (
      // <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner />
      // </div>
    );
  }

  if (currentUser.accountStatus === "rejected") {
    if (currentUser.accountRejectionReason === "ghosting") {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mx-4">
          <h2 className="text-2xl font-bold text-red-700 mb-2">
            Account Removed
          </h2>
          <p className="text-gray-700 mb-2">
            Your account has been permanently removed due to our zero-tolerance
            ghosting policy.
          </p>
          <p className="text-gray-600 text-sm">
            You confirmed interest in your match, engaged in chat, and did not
            show up for the date. This decision is final and cannot be appealed.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mx-4">
        <h2 className="text-2xl font-bold mb-2">Profile Needs Update</h2>
        <p className="text-gray-700 mb-4">
          {currentUser.accountRejectionReason ||
            "Your profile didn't meet our quality standards."}
        </p>
        <Button onClick={() => router.push("/onboarding/resubmit")}>
          Resubmit Profile
        </Button>
      </div>
    );
  }

  if (currentUser.accountStatus === "pending") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mx-4">
        <h2 className="text-2xl font-bold mb-2">Profile Under Review</h2>
        <p className="text-gray-700">
          Your profile is being reviewed by our team. You'll receive an email
          within 24 hours when your profile is approved or if we need additional
          information.
        </p>
      </div>
    );
  }

  if (currentUser.accountStatus === "waitlisted") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center mx-4">
        <h2 className="text-2xl font-bold mb-2">You're on the Waitlist</h2>
        <p className="text-gray-700 mb-2">
          Great news! Your profile has been reviewed and approved.
        </p>
        <p className="text-gray-700">
          You're currently on our waitlist as we carefully manage our community.
          We'll notify you via email as soon as your account is fully activated
          and you can start receiving matches.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 px-4">
      {!currentUser.verificationDocStorageId && (
        <VerificationBanner />
      )}
      {children}
    </div>
  );
}

function VerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const uploadDoc = useMutation(api.users.uploadVerificationDoc);

  if (dismissed || done) return null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be less than 10MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        fileType: file.type as string,
      });

      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": compressed.type },
        body: compressed,
      });
      const { storageId } = await result.json();

      await uploadDoc({ verificationDocStorageId: storageId });
      setDone(true);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
      <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-blue-900">
          Verify your identity
        </p>
        <p className="text-xs text-blue-700 mt-0.5">
          Upload a photo of your ID to complete verification.
        </p>
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <Button
          size="sm"
          variant="outline"
          className="mt-2 text-xs h-7 border-blue-300 text-blue-700 hover:bg-blue-100"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <FileText className="w-3 h-3 mr-1.5" />
          {uploading ? "Uploading..." : "Upload ID"}
        </Button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-blue-400 hover:text-blue-600 p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
