import React, { useEffect, useRef } from 'react';

/**
 * 468x60 Display Banner Ad
 * Uses iframe srcDoc to isolate atOptions and document.write without crashing React SPA.
 */
export function AdBanner468x60() {
  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: transparent;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : 'd0dace7979d090e4f140aafd53c2fc40',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://bauval.org/22/d0dace7979d090e4f140aafd53c2fc40"></script>
      </body>
    </html>
  `;

  return (
    <div className="flex flex-col items-center justify-center my-4 mx-auto text-center w-full">
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
          Sponsored Announcement (468x60)
        </span>
      </div>
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2 shadow-inner flex items-center justify-center max-w-full overflow-hidden mx-auto">
        <iframe
          title="Sponsored Ad 468x60"
          width="468"
          height="60"
          scrolling="no"
          frameBorder="0"
          className="max-w-full block"
          style={{ border: 'none', overflow: 'hidden' }}
          srcDoc={iframeSrcDoc}
        />
      </div>
    </div>
  );
}

/**
 * Native Ad Container Placement
 * <div id="container-2210f2a36cb12eedc9c09b1e9e57a9a0"></div>
 * Injects <script async="async" data-cfasync="false" src="https://bauval.org/21/2210f2a36cb12eedc9c09b1e9e57a9a0"></script>
 */
export function AdContainerNative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptInjectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (scriptInjectedRef.current) return;
    scriptInjectedRef.current = true;

    const script = document.createElement('script');
    script.src = 'https://bauval.org/21/2210f2a36cb12eedc9c09b1e9e57a9a0';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    } else {
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center my-4 mx-auto text-center w-full">
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
          Featured Partner Offers
        </span>
      </div>
      <div
        ref={containerRef}
        className="w-full max-w-2xl min-h-[90px] rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 flex flex-col items-center justify-center text-center text-xs text-slate-400 mx-auto shadow-inner"
      >
        <div id="container-2210f2a36cb12eedc9c09b1e9e57a9a0" className="w-full flex justify-center text-center mx-auto" />
      </div>
    </div>
  );
}

/**
 * MiddleAdsSection:
 * Positions the display ads right in the middle (center) of the page layout,
 * keeping the popunder in <head> intact.
 */
export function MiddleAdsSection({ title }: { title?: string }) {
  return (
    <div className="my-8 py-5 px-4 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-900/30 to-slate-900/60 backdrop-blur flex flex-col items-center justify-center text-center mx-auto max-w-4xl shadow-lg">
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="h-px w-8 bg-slate-800" />
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
          {title || 'Sponsored Community Showcase'}
        </span>
        <span className="h-px w-8 bg-slate-800" />
      </div>

      <div className="w-full flex flex-col items-center justify-center gap-4">
        {/* Centered 468x60 Banner */}
        <AdBanner468x60 />

        {/* Centered Native Ad Placement */}
        <AdContainerNative />
      </div>
    </div>
  );
}
