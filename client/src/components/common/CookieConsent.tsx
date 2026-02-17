import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONSENT_KEY = 'alpine-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-full max-w-lg mx-auto px-4',
        'animate-slideUp',
      )}
    >
      <div
        className={cn(
          'relative bg-[var(--bg-card)] border border-[var(--border-color)]',
          'rounded-2xl p-6 shadow-2xl dark:shadow-black/40',
          'backdrop-blur-xl backdrop-saturate-150',
        )}
      >
        <button
          onClick={handleDecline}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-200"
          aria-label="Închide"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/10">
            <Shield className="h-5.5 w-5.5 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-1">
              Confidențialitate și Cookie-uri
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
              Folosim cookie-uri esențiale pentru funcționarea aplicației și cookie-uri analitice pentru îmbunătățirea experienței.
              Datele tale sunt protejate conform GDPR și legislației române.
            </p>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleAccept}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[13px] font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200"
              >
                Accept toate
              </button>
              <button
                onClick={handleDecline}
                className="px-5 py-2 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl text-[13px] font-semibold hover:bg-[var(--bg-tertiary)]/60 transition-all duration-200"
              >
                Doar esențiale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
