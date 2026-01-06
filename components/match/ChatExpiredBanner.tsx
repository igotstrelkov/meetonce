import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface ChatExpiredBannerProps {
  matchId: string;
}

export function ChatExpiredBanner({ matchId }: ChatExpiredBannerProps) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-orange-900 mb-1">
            Chat Has Expired
          </h3>
          <p className="text-sm text-orange-800 mb-2">
            This chat expired on Friday at 11:59 PM. Messages are read-only now.
          </p>
          <Link
            href={`/feedback/${matchId}`}
            className="text-sm font-medium text-orange-900 hover:text-orange-700 underline"
          >
            Complete post-date feedback to share your experience →
          </Link>
        </div>
      </div>
    </div>
  );
}
