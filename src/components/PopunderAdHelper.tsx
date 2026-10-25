import React, { useEffect, useState } from 'react';
import { ExternalLink, AlertTriangle, ShieldAlert } from 'lucide-react';

const POPUNDER_SCRIPT_URL = 'https://abscloud.org/1/d616a0a140edef6f623db31ba4bcc18b';

/**
 * PopunderAdHelper:
 * 1. Ensures the popunder script is present in <head>
 * 2. Detects if running inside an iframe (which browser sandboxes block popunders by default)
 * 3. Detects if an adblocker blocked the script
 * 4. Provides a direct test link to open in a real browser tab
 */
export const PopunderAdHelper: React.FC = () => {
  const [isInIframe, setIsInIframe] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if inside iframe
    try {
      if (window.self !== window.top) {
        setIsInIframe(true);
      }
    } catch {
      setIsInIframe(true);
    }

    // 2. Ensure script is mounted in <head>
    let scriptTag = document.querySelector(`script[src="${POPUNDER_SCRIPT_URL}"]`) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.src = POPUNDER_SCRIPT_URL;
      scriptTag.setAttribute('data-cfasync', 'false');
      scriptTag.async = true;
      document.head.appendChild(scriptTag);
    }

    // Listen for error (e.g. adblocker)
    const handleError = () => {
      setIsBlocked(true);
    };
    scriptTag.addEventListener('error', handleError);

    return () => {
      if (scriptTag) {
        scriptTag.removeEventListener('error', handleError);
      }
    };
  }, []);

  // If in iframe or blocked by adblocker, show a discreet helpful tip
  if ((!isInIframe && !isBlocked) || isDismissed) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-200">
        <div className="flex items-center gap-2.5">
          {isBlocked ? (
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          )}
          <span>
            {isBlocked ? (
              <>
                <strong>AdBlocker Detected:</strong> Your browser or ad blocker is blocking the popunder script. Please disable AdBlock / Brave Shields on this domain to test ads.
              </>
            ) : (
              <>
                <strong>Popunder Test Notice:</strong> Popunder ads are automatically blocked inside iframe editor previews by browser security. Open in a new tab and click anywhere on the page to trigger the popunder.
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isInIframe && (
            <a
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold border border-amber-500/40 transition-colors"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-amber-400/80 hover:text-amber-300 text-[11px] px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
