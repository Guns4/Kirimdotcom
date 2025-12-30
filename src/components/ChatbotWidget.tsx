'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  links?: { url: string; text: string }[];
  timestamp: Date;
}

const FAQ_RESPONSES: Record<string, { answer: string; link?: string }> = {
  'cek resi': {
    answer:
      'Untuk cek resi, masukkan nomor resi di halaman utama lalu klik "Lacak". Status paket akan muncul otomatis! 📦',
    link: '/tutorial/cek-resi',
  },
  'cek ongkir': {
    answer:
      'Kunjungi halaman Cek Ongkir, pilih kota asal & tujuan, lalu pilih kurir. Harga akan tampil otomatis! 💰',
    link: '/cek-ongkir',
  },
  daftar: {
    answer:
      'Klik "Daftar" di pojok kanan atas, masukkan email & password, lalu verifikasi email Anda! ✅',
    link: '/auth/register',
  },
  'lupa password': {
    answer:
      'Klik "Lupa Password" di halaman login, masukkan email, cek inbox untuk link reset! 🔐',
    link: '/auth/forgot-password',
  },
  wallet: {
    answer:
      'Masuk ke Dashboard > Wallet > Isi Saldo. Pilih nominal dan metode pembayaran! 💳',
    link: '/dashboard/wallet',
  },
  'kurir lokal': {
    answer:
      'Buka halaman Kurir Lokal, pilih kecamatan, lalu klik "Pesan" pada kurir yang online! 🏍️',
    link: '/kurir-lokal',
  },
  rekber: {
    answer:
      'Rekber = Rekening Bersama. Uang ditahan CekKirim sampai barang diterima. Aman! 🔒',
    link: '/tutorial/rekber',
  },
  hubungi: {
    answer:
      'Hubungi kami via email support@cekkirim.com atau WA 0812-xxxx-xxxx! 📞',
    link: '/contact',
  },
};

function findAnswer(query: string): { answer: string; link?: string } | null {
  const lowerQuery = query.toLowerCase();

  for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
    if (lowerQuery.includes(keyword)) {
      return response;
    }
  }

  return null;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Halo! 👋 Saya asisten CekKirim. Ada yang bisa saya bantu?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Find answer
    setTimeout(() => {
      const response = findAnswer(input);

      let botMessage: Message;

      if (response) {
        botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: response.answer,
          links: response.link
            ? [{ url: response.link, text: 'Lihat selengkapnya →' }]
            : undefined,
          timestamp: new Date(),
        };
      } else {
        botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: 'Maaf, saya belum mengerti pertanyaan Anda. Coba tanyakan tentang: cek resi, cek ongkir, daftar akun, wallet, atau kurir lokal. 🤔',
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const quickQuestions = [
    'Cara cek resi',
    'Cek ongkir',
    'Kurir lokal',
    'Apa itu rekber?',
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="chatbot-toggle"
        aria-label="Open chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <span className="chatbot-avatar">🤖</span>
          <div>
            <div className="chatbot-title">CekKirim Bot</div>
            <div className="chatbot-status">● Online</div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="chatbot-close">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chatbot-message ${msg.type === 'user' ? 'user' : 'bot'}`}
          >
            {msg.type === 'bot' && (
              <span className="chatbot-message-avatar">🤖</span>
            )}
            <div className="chatbot-message-content">
              <p>{msg.text}</p>
              {msg.links?.map((link, i) => (
                <a key={i} href={link.url} className="chatbot-link">
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="chatbot-quick">
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => {
              setInput(q);
              handleSend();
            }}
            className="chatbot-quick-btn"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="chatbot-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ketik pertanyaan..."
          className="chatbot-input"
        />
        <button onClick={handleSend} className="chatbot-send">
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatbotWidget;
