import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'سلام! من دستیار هوشمند آزمایشگاه سخت‌افزار هستم. هر سوالی درباره قطعات، مونتاژ، یا عیب‌یابی کدهای بوق بایوس داری بپرس!',
      time: 'هم‌اکنون'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Unexpected response format');
      }
      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.reply || 'متأسفانه پاسخی دریافت نشد.',
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'خطا در برقراری ارتباط با سرور. لطفاً دوباره تلاش کنید.',
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "چرا تصویر مانیتور بالا نمی‌آید؟",
    "کد بوق ۱-۱-۲-۳ چیست؟",
    "نکات ایمنی نصب پردازنده"
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="دستیار هوشمند"
          className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1d314b] text-white shadow-2xl hover:bg-[#263f60] transition-all hover:scale-105 group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <Bot className="w-5 h-5 text-blue-300 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold hidden sm:inline">دستیار سخت‌افزار</span>
        </button>
      </div>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 left-6 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="p-4 bg-[#1d314b] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/50 flex items-center justify-center text-blue-200">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold">دستیار هوشمند سخت‌افزار</h3>
                <span className="text-[10px] text-blue-200 block">پاسخگویی آموزشی به زبان فارسی</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="text-[10px] font-medium whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-900 transition"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fafafa]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tl-none'
                    : 'bg-white text-gray-800 border border-gray-200/80 shadow-sm rounded-tr-none'
                }`}>
                  {m.text}
                  <span className={`block text-[9px] mt-1 text-left ${
                    m.sender === 'user' ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  <Bot className="w-3.5 h-3.5 text-gray-600" />
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-tr-none shadow-sm flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] pr-1">در حال تحلیل…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="پرسش خود را بنویسید…"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#1d314b] text-white hover:bg-[#263f60] disabled:bg-gray-200 disabled:cursor-not-allowed transition"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
