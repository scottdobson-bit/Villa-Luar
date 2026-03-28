import React, { useState, useRef, useEffect } from 'react';

const WA_NUMBER = '34711013086';
const WA_URL = `https://wa.me/${WA_NUMBER}`;

// WhatsApp SVG logo
const WhatsAppIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.522 5.836L.036 23.964l6.305-1.654A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.36-.213-3.719.976.993-3.626-.234-.373A9.818 9.818 0 1112 21.818z"/>
  </svg>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = () => {
    const text = message.trim();
    const url = text
      ? `${WA_URL}?text=${encodeURIComponent(text)}`
      : WA_URL;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {/* ── Chat Panel ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-[340px] bg-white dark:bg-stone-800 rounded-2xl shadow-2xl flex flex-col border border-stone-200 dark:border-stone-700 overflow-hidden"
             style={{ animation: 'fadeInUp 0.2s ease' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
               style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)' }}>
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <WhatsAppIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Villa Luar</p>
                <p className="text-green-200 text-xs">Typically replies in minutes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat background with greeting bubble */}
          <div className="flex-1 px-4 py-5"
               style={{ background: '#ECE5DD url("data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3C/svg%3E") repeat' }}>
            {/* Agent greeting bubble */}
            <div className="flex items-end gap-2 max-w-[85%]">
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <p className="text-stone-800 text-sm leading-relaxed">
                  👋 Hi! Interested in Villa Luar? Send us a message and we'll get back to you right away.
                </p>
                <p className="text-stone-400 text-[10px] text-right mt-1">now</p>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="px-3 py-3 bg-[#F0F0F0] dark:bg-stone-700 flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-full bg-white dark:bg-stone-600 text-stone-800 dark:text-white text-sm border-none focus:outline-none resize-none leading-snug"
              style={{ maxHeight: '96px', overflowY: 'auto' }}
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: '#25D366' }}
              aria-label="Send on WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5 translate-x-0.5">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="py-2 text-center bg-[#F0F0F0] dark:bg-stone-700 border-t border-stone-200 dark:border-stone-600">
            <span className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
              <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
              Continue on WhatsApp
            </span>
          </div>
        </div>
      )}

      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none ${!isOpen ? 'chatbot-pulse' : ''}`}
        style={{ background: isOpen ? '#075E54' : '#25D366' }}
        aria-label={isOpen ? 'Close chat' : 'Chat on WhatsApp'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <WhatsAppIcon className="w-7 h-7 text-white" />
        )}
      </button>
    </div>
  );
};

export default Chatbot;
