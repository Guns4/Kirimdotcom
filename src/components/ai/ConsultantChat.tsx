'use client';

import { useState, useRef, useEffect } from 'react';
import { askBusinessConsultant } from '@/app/actions/ai-consultant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Bot, User, Send, Sparkles, Loader2 } from 'lucide-react';

export function ConsultantChat() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: 'Halo Boss! Ada yang bisa saya bantu analisa hari ini?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askBusinessConsultant(userMsg.content);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res?.answer },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Maaf, saya sedang pusing (Error).' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="h-[500px] flex flex-col border-indigo-100 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-200" />
          AI Business Consultant
          <span className="bg-white/20 text-[10px] px-2 rounded-full">
            BETA
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-gray-200' : 'bg-indigo-100'}`}
                >
                  {m.role === 'user' ? (
                    <User className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm max-w-[80%] ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl text-sm text-gray-400 italic">
                  Sedang menganalisa data toko...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 border-t bg-gray-50/50">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Tanya soal retur, profit, dll..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="bg-white"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
