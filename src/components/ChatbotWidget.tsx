import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  RefreshCw, 
  User, 
  CheckCircle,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { MaterialItem } from '../types/procurement';

interface ChatbotWidgetProps {
  materials: MaterialItem[];
  currency: 'USD' | 'PKR';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ materials, currency }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am the **ATCO Sourcing Assistant**.\n\nI have direct access to ATCO's master procurement dataset, approved vendor lists (AVL), pricing records, and operational policies. How can I assist you with sourcing intelligence today?",
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "Which APIs are single-sourced in China?",
    "Show total spend in USD for Top 5% materials",
    "Which materials have Finished Goods reliance >= 20?",
    "What is ATCO's shelf-life and rejection policy?"
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      const data = await response.json();

      const botReply = data.reply || getLocalProcurementAnswer(query, materials);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      // Offline fallback
      const botReply = getLocalProcurementAnswer(query, materials);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-slate-800 transition-all transform hover:scale-105 border border-slate-700 group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
          </div>
          <span className="text-xs font-bold tracking-tight">ATCO Sourcing AI</span>
        </button>
      )}

      {/* Slide-Out Chatbot Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[580px] max-h-[85vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  ATCO Sourcing Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Grounded on 73 Master SCM Materials
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2 py-1 text-[10px] font-medium bg-white border border-slate-200 hover:border-slate-300 rounded-md text-slate-700 whitespace-nowrap transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-xl leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white font-medium rounded-tr-none'
                      : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/60'
                  }`}
                >
                  <div className="text-[11px]">{msg.text}</div>
                  <div className={`text-[9px] mt-1 font-mono ${msg.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Evaluating ATCO procurement database...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about materials, pricing, single-sources..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

function getLocalProcurementAnswer(query: string, materials: MaterialItem[]): string {
  const q = query.toLowerCase();

  if (q.includes('china') && q.includes('single')) {
    const chinaSingleApis = materials.filter(m => 
      m.type === 'API' && 
      (m.sourceType.includes('Single') || m.activeMfgCount === 1) &&
      (m.activeMfgOrigin || '').toUpperCase().includes('CHINA')
    );
    return `**APIs Single-Sourced from China (${chinaSingleApis.length} identified)**:
${chinaSingleApis.slice(0, 6).map(m => `• **${m.materialName}** (${m.materialCode}): $${m.netPriceUSD}/kg, Annual Spend: $${m.annualBuyingValueUSD.toLocaleString()} USD, Mfg: ${m.activeMfg}`).join('\n')}

*Recommendation*: Sourcing inquiries should be issued for alternate qualification in Europe or India.`;
  }

  if (q.includes('spend') || q.includes('top 5') || q.includes('5%')) {
    const sorted = [...materials].sort((a, b) => b.annualBuyingValueUSD - a.annualBuyingValueUSD);
    const top5 = sorted.slice(0, 5);
    const topSpend = top5.reduce((acc, m) => acc + m.annualBuyingValueUSD, 0);

    return `**Top Spend Contribution Materials**:
Total spend for top 5 materials: **$${topSpend.toLocaleString()} USD**:
${top5.map((m, idx) => `${idx + 1}. **${m.materialName}**: $${m.annualBuyingValueUSD.toLocaleString()} USD (${m.sourceType})`).join('\n')}

These items represent key targets for strategic volume rebates and dual-vendor allocation.`;
  }

  if (q.includes('fg') || q.includes('reliance') || q.includes('finished')) {
    const highFg = materials.filter(m => m.fgCount >= 20).sort((a, b) => b.fgCount - a.fgCount);
    return `**High Finished Goods (FG) Dependency Materials**:
${highFg.slice(0, 5).map(m => `• **${m.materialName}**: Supports **${m.fgCount} Finished Products** (Active Mfgs: ${m.activeMfgCount})`).join('\n')}

Disruptions in these raw materials would impact the widest range of ATCO commercial SKUs.`;
  }

  if (q.includes('policy') || q.includes('rule') || q.includes('shelf') || q.includes('rejection')) {
    return `**ATCO SCM Operational Policy Rules**:
1. **Shelf Life**: Standard APIs/Excipients require &ge;75% residual shelf-life at arrival; pellets require &ge;94%.
2. **QC Rejections**: Compensation/replacement debit note due within 15 calendar days.
3. **PFI Issuance**: Required within 2 business days of order confirmation.
4. **Sample Testing**: Commercial candidate suppliers must supply free sample + working standard within 30 days.`;
  }

  return `I evaluated ATCO's master procurement database for "${query}".
The portfolio tracks 73 raw materials across APIs, Excipients, and Packaging Materials with an annual spend of $7.8M USD.
Would you like to examine specific material pricing, supplier rejections, or initiate an alternate sourcing inquiry?`;
}
