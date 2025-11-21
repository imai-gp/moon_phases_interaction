import React, { useState, useRef, useEffect } from 'react';
import { chatWithMoon } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Sparkles } from 'lucide-react';

const ChatBot: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'こんにちは！お月さまのことで知りたいことがあったら聞いてね！' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await chatWithMoon(input);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-800/50 rounded-3xl p-4 border border-slate-700 h-full flex flex-col shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-3 shrink-0">
        <Sparkles className="text-yellow-300" size={20} />
        <h3 className="font-bold text-lg">Gemini先生に質問</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-sky-600 text-white rounded-tr-sm' 
                : 'bg-slate-700 text-slate-100 rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 p-4 rounded-2xl rounded-tl-sm">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="ここに入力してね"
          className="flex-1 bg-slate-900/80 border border-slate-600 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 text-white p-3 rounded-full transition-colors shadow-lg flex-shrink-0"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;