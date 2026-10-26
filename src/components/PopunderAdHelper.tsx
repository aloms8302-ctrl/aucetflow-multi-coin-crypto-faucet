import React, { useEffect, useState } from 'react';
import { ExternalLink, AlertTriangle, ShieldAlert, CheckCircle2, MousePointer, Info, ChevronDown, ChevronUp } from 'lucide-react';

const POPUNDER_SCRIPT_URL = 'https://abscloud.org/1/d616a0a140edef6f623db31ba4bcc18b';
const PUBLIC_PREVIEW_URL = 'https://ais-pre-v7ovdhp5zsdnv7egcllt3w-774631143578.asia-northeast1.run.app';

/**
 * PopunderAdHelper:
 * 1. Ensures the Adsterra popunder script is correctly mounted and executed in <head>.
 * 2. Detects if running inside an iframe (AI Studio preview blocks window.open popups by browser security).
 * 3. Detects if an Adblocker (uBlock, AdBlock, Brave Shields) is blocking abscloud.org.
 * 4. Provides a 1-click test button to trigger a real document click event for the popunder.
 * 5. Provides a direct link to open the app in a standalone browser tab where popunders trigger smoothly.
 */
export const PopunderAdHelper: React.FC = () => {
  const [isInIframe, setIsInIframe] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if running inside an iframe
    try {
      if (window.self !== window.top) {
        setIsInIframe(true);
      }
    } catch {
      setIsInIframe(true);
    }

    // 2. Find or inject the popunder script in <head>
    let scriptTag = document.querySelector(`script[src="${POPUNDER_SCRIPT_URL}"]`) as HTMLScriptElement | null;
    
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.src = POPUNDER_SCRIPT_URL;
      scriptTag.setAttribute('data-cfasync', 'false');
      scriptTag.async = true;
      document.head.appendChild(scriptTag);
    }

    const handleLoad = () => {
      setIsLoaded(true);
      setIsBlocked(false);
    };

    const handleError = () => {
      setIsBlocked(true);
      setIsLoaded(false);
    };

    scriptTag.addEventListener('load', handleLoad);
    scriptTag.addEventListener('error', handleError);

    // Also verify if already loaded
    if ((scriptTag as any).readyState === 'complete' || (scriptTag as any).readyState === 'loaded') {
      setIsLoaded(true);
    }

    // 3. Global click listener to track user clicks and ensure bubbling to document
    const handleGlobalClick = () => {
      setClickCount((prev) => prev + 1);
    };
    window.addEventListener('click', handleGlobalClick);

    return () => {
      if (scriptTag) {
        scriptTag.removeEventListener('load', handleLoad);
        scriptTag.removeEventListener('error', handleError);
      }
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Trigger test click on document to activate popunder
  const handleTriggerPopunder = () => {
    try {
      // Simulate click event on document body
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      document.body.dispatchEvent(event);
      setClickCount((prev) => prev + 1);
    } catch (e) {
      console.warn('Simulated click error:', e);
    }
  };

  if (isDismissed) return null;

  return (
    <div className="w-full my-3 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-3.5 text-xs text-slate-300 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isBlocked ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 shrink-0 border border-rose-500/30">
              <ShieldAlert className="h-4 w-4" />
            </span>
          ) : isInIframe ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30">
              <AlertTriangle className="h-4 w-4" />
            </span>
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                Popunder Ad Status ({isBlocked ? 'Blocked by AdBlock' : isInIframe ? 'Iframe Restricted' : 'Active'})
              </span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300">
                abscloud.org
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isBlocked ? (
                <span className="text-rose-300">
                  ব্রাউজারের <strong>AdBlocker / Brave Shields</strong> পপআন্ডার স্ক্রিপ্ট ব্লক করেছে। AdBlock নিষ্ক্রিয় করুন।
                </span>
              ) : isInIframe ? (
                <span>
                  প্রিভিউ আইফ্রেমের (Iframe) ভেতর ব্রাউজার সিকিউরিটি পপআপ ব্লক করে। <strong>আসল ব্রাউজার ট্যাবে</strong> টেস্ট করুন।
                </span>
              ) : (
                <span className="text-emerald-400">
                  পপআন্ডার স্ক্রিপ্ট সক্রিয় রয়েছে। পেজের যেকোনো স্থানে প্রথম ক্লিক করলেই পপআন্ডার চালু হবে।
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          {/* Test Click Trigger */}
          <button
            type="button"
            onClick={handleTriggerPopunder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition-all active:scale-95"
            title="Click to trigger document click event for the popunder"
          >
            <MousePointer className="h-3.5 w-3.5" />
            <span>Test Click ({clickCount})</span>
          </button>

          {/* Open in Standalone Tab */}
          <a
            href={PUBLIC_PREVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow transition-all"
            title="Open in a standalone browser window to bypass iframe popunder blocking"
          >
            <span>Open in Real Tab</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Info toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Details & Troubleshooting"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-[11px] text-slate-500 hover:text-slate-300 px-1 py-1"
          >
            Hide
          </button>
        </div>
      </div>

      {/* Expanded Troubleshooting Information */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg">
          <div className="space-y-1">
            <span className="font-bold text-slate-200 block">1. Iframe Sandbox Policy</span>
            <p>
              Google AI Studio এডিটর প্রিভিউ একটি iframe-এ চলে। আধুনিক ব্রাউজারগুলো (Chrome, Edge) প্রিভিউ ফ্রেমের ভেতরে যেকোনো `window.open` পপআপ ব্লক করে দেয়। তাই আসল ব্রাউজার ট্যাবে (Real Tab) পরীক্ষা করা প্রয়োজন।
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-slate-200 block">2. Adsterra Domain Approval</span>
            <p>
              Adsterra ড্যাশবোর্ডে যে ডোমেইনটি রেজিস্টার করা হয়েছে, ডোমেইন স্ট্যাটাস যদি "Approved" বা "Active" না থাকে তবে Adsterra নেটওয়ার্ক কোনো বিজ্ঞাপন পাঠায় না (HTTP 403 বা Blank দেখায়)।
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-slate-200 block">3. 1 Popunder Per 24 Hours</span>
            <p>
              Adsterra-র ডিফল্ট নিয়মে প্রতি ব্যবহারকারী/আইপিতে দিনে ১ বার বা নির্দিষ্ট সেশনে ১ বার পপআন্ডার আসে। টেস্ট করার সময় ইনকগনিটো (Incognito) উইন্ডোতে টেস্ট করলে নিশ্চিত হওয়া যায়।
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
