import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WHATSAPP_URL = 'https://wa.me/8801578367800';
const FALLBACK_TEXT =
  'AI chat শীঘ্রই আসছে — জরুরি হলে WhatsApp-এ মেসেজ করুন';
const GREETING =
  'আসসালামু আলাইকুম! আমি Tayyib Vista-র AI সহায়ক। হালাল কন্টেন্ট, নামাজের সময় বা কিবলা নিয়ে প্রশ্ন করুন।';

export const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading, showFallback, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setShowFallback(false);
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && typeof data.reply === 'string' && data.reply.trim()) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setShowFallback(true);
      }
    } catch {
      setShowFallback(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed left-4 bottom-24 md:bottom-5 z-[9998] flex flex-col items-start gap-3">
      {open && (
        <div
          role="dialog"
          aria-label="Tayyib Vista AI সহায়ক"
          className="w-[calc(100vw-2rem)] max-w-[360px] bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden flex flex-col"
        >
          <div className="bg-[#0F5132] text-white px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold leading-tight">Tayyib Vista AI সহায়ক</p>
              <p className="text-[11px] text-emerald-100 leading-tight">
                হালাল কন্টেন্ট নিয়ে প্রশ্ন করুন
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="চ্যাট বন্ধ করুন"
              className="p-1.5 rounded-full hover:bg-white/15 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={listRef} className="h-72 overflow-y-auto px-3 py-3 space-y-2.5 bg-[#FAF9F6]">
            <div className="flex justify-start">
              <p className="max-w-[85%] text-xs leading-relaxed bg-white border border-stone-200 rounded-xl rounded-bl-sm px-3 py-2 text-stone-800">
                {GREETING}
              </p>
            </div>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <p
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] text-xs leading-relaxed bg-[#0F5132] text-white rounded-xl rounded-br-sm px-3 py-2 whitespace-pre-wrap'
                      : 'max-w-[85%] text-xs leading-relaxed bg-white border border-stone-200 rounded-xl rounded-bl-sm px-3 py-2 text-stone-800 whitespace-pre-wrap'
                  }
                >
                  {m.content}
                </p>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <p className="text-xs text-stone-500 bg-white border border-stone-200 rounded-xl rounded-bl-sm px-3 py-2">
                  উত্তর লেখা হচ্ছে…
                </p>
              </div>
            )}
            {showFallback && (
              <div className="flex justify-start">
                <p className="max-w-[85%] text-xs leading-relaxed bg-amber-50 border border-amber-200 rounded-xl rounded-bl-sm px-3 py-2 text-stone-800">
                  {FALLBACK_TEXT}{' '}
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#0F5132] underline underline-offset-2"
                  >
                    WhatsApp
                  </a>
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-stone-200 px-3 py-2.5 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              maxLength={1000}
              placeholder="আপনার প্রশ্ন লিখুন…"
              aria-label="আপনার প্রশ্ন লিখুন"
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:border-[#0F5132]"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="মেসেজ পাঠান"
              className="p-2.5 rounded-lg bg-[#0F5132] text-white hover:bg-[#0b3e26] transition-colors disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'চ্যাট বন্ধ করুন' : 'AI সহায়কের সাথে চ্যাট করুন'}
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-[#0F5132] text-white flex items-center justify-center shadow-lg hover:bg-[#0b3e26] transition-colors"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};
