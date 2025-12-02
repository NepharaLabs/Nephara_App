'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function AppPage8Bit() {
  const { messages, sendMessage, status } = useChat();
  const { connected, publicKey } = useWallet();
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');

  // Initialize cooldown state from localStorage
  const [cooldownRemaining, setCooldownRemaining] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const storedTime = localStorage.getItem('lastSubmitTime');
    if (storedTime) {
      const lastTime = parseInt(storedTime, 10);
      const now = Date.now();
      const timeSinceLastSubmit = (now - lastTime) / 1000;
      if (timeSinceLastSubmit < 50) {
        return Math.ceil(50 - timeSinceLastSubmit);
      } else {
        localStorage.removeItem('lastSubmitTime');
      }
    }
    return 0;
  });

  const [lastSubmitTime, setLastSubmitTime] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const storedTime = localStorage.getItem('lastSubmitTime');
    return storedTime ? parseInt(storedTime, 10) : 0;
  });

  const [contractAddress, setContractAddress] = useState('');

  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining((prev) => {
          const newValue = Math.max(0, prev - 1);
          if (newValue === 0) {
            localStorage.removeItem('lastSubmitTime');
          }
          return newValue;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const now = Date.now();
    const timeSinceLastSubmit = (now - lastSubmitTime) / 1000;

    if (timeSinceLastSubmit < 50 && lastSubmitTime > 0) {
      const remaining = Math.ceil(50 - timeSinceLastSubmit);
      setCooldownRemaining(remaining);
      return;
    }

    if (!input.trim()) return;

    let finalMessage = input;
    if (contractAddress.trim()) {
      finalMessage = `[Service: ${contractAddress.trim()}]\n\n${input}`;
    }

    setLastSubmitTime(now);
    setCooldownRemaining(50);
    localStorage.setItem('lastSubmitTime', now.toString());

    sendMessage({ text: finalMessage });

    setInput('');
    setContractAddress('');
  };

  return (
    <div className="relative min-h-screen bg-[#0f0820] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img src="/app_background.png" alt="Background" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />

        {/* 8-bit Pixel Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(112, 64, 190, .4) 25%, rgba(112, 64, 190, .4) 26%, transparent 27%, transparent 74%, rgba(112, 64, 190, .4) 75%, rgba(112, 64, 190, .4) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(112, 64, 190, .4) 25%, rgba(112, 64, 190, .4) 26%, transparent 27%, transparent 74%, rgba(112, 64, 190, .4) 75%, rgba(112, 64, 190, .4) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '16px 16px',
            imageRendering: 'pixelated'
          }}
        />
        {/* CRT Scanlines */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
            backgroundSize: '100% 2px',
            animation: 'scanline 8s linear infinite'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* 8-bit Game Header */}
        <header className="py-2">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="group flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      width={70}
                      height={70}
                      className="relative z-10"
                    />
                  </div>
                </Link>
              <WalletMultiButton className="wallet-adapter-button !bg-primary !border-2 !border-primary-bright !shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] hover:!translate-y-0.5 hover:!shadow-[1.5px_1.5px_0_0_rgba(0,0,0,0.3)] !transition-all !font-mono !text-sm !font-bold" />
            </div>
          </div>
        </header>

        {/* Main Game Screen */}
        <div className="container mx-auto max-w-7xl px-4">
          {/* Messages Container - Game Window Style */}
          <div className="mb-6 min-h-[500px] border border-primary backdrop-blur-lg bg-purple-950/80 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] relative">
            {/* Title Bar */}
            <div className="font-display border-b border-primary bg-primary-20 px-4 py-2 text-primary-light">
              LUNA402 AUTONOMOUS PAYMENT SYSTEM v1.1.0
            </div>

            {/* Messages Area */}
            <div className="space-y-4 p-6 max-h-[500px] overflow-y-auto">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-display text-gray-100">
                    {connected ? '> Luna is awaiting your command...' : '> Connect wallet to unlock Luna'}
                  </p>

                  {connected && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                      {[
                        { text: 'How does x402 work?', icon: '🛠️' },
                        { text: 'What can Luna402 do?', icon: '🤖' },
                        { text: 'Simulate a payment example with Luna402', icon: '▶️' },
                        { text: 'Check system status', icon: '⌛' },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(item.text)}
                          className="border flex items-center justify-ce border-primary bg-primary-20 p-4 cursor-pointer font-display text-white hover:bg-primary-30 hover:translate-y-0.5 transition-all shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] hover:shadow-[1.5px_1.5px_0_0_rgba(0,0,0,0.3)]"
                        >
                          <span className="text-2xl mr-4">{item.icon}</span>
                          {item.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] border-2 py-3 px-4 font-mono text-sm ${
                        message.role === 'user'
                          ? 'border-primary-light bg-primary-20 text-gray-200 shadow-[3px_3px_0_0_rgba(112,64,190,0.4)]'
                          : 'border-primary bg-[var(--bg-darker)] text-gray-100 shadow-[3px_3px_0_0_rgba(112,64,190,0.3)]'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-primary">
                          <div className="w-1 h-1 bg-primary animate-pulse" />
                          <span className="text-primary-light font-bold">LUNA402</span>
                        </div>
                      )}

                      {message.parts?.map((part, partIndex) => (
                        <div key={`${message.id}-${partIndex}`}>
                          {part.type === 'text' && (
                            message.role === 'assistant' ? (
                              <div className="markdown-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap">{part.text}</div>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <div className="flex justify-start">
                  <div className="border-2 border-primary bg-primary-20 p-4 flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="font-mono text-sm text-white">Processing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Game Controller Style */}
          <div className="border border-primary backdrop-blur-lg bg-purple-950/80 p-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]">
            <form onSubmit={handleFormSubmit} className="space-y-3">
              {/* Service Input */}
              <div className="border border-primary bg-primary-20 p-2">
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder={connected ? '- ENTER PAYMENT ENDPOINT -' : '- LOCKED -'}
                  className="w-full bg-transparent px-2 py-1 font-mono text-sm text-white placeholder-primary-light focus:outline-none"
                  disabled={!connected || isLoading || cooldownRemaining > 0}
                />
              </div>

              {/* Message Input */}
              <div className="flex gap-3">
                <div className="flex-1 border border-primary bg-primary-20 p-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={connected ? '- ENTER COMMAND -' : '- SYSTEM LOCKED -'}
                    className="w-full bg-transparent px-2 py-2 font-mono text-sm text-white placeholder-primary-light focus:outline-none"
                    disabled={!connected || isLoading || cooldownRemaining > 0}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!connected || isLoading || !input.trim() || cooldownRemaining > 0}
                  className="border cursor-pointer border-primary-light bg-primary-20 px-6 font-mono text-sm font-bold text-primary-light hover:bg-primary-30 disabled:opacity-40 disabled:cursor-not-allowed shadow-[3px_3px_0_0_rgba(112,64,190,0.4)] hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0_0_rgba(112,64,190,0.4)] transition-all"
                >
                  {isLoading ? '...' : cooldownRemaining > 0 ? cooldownRemaining : <Send />}
                </button>
              </div>

              {/* Status Text */}
              <p className="text-center font-display text-sm text-gray-100">
                {!connected ? (
                  '> WALLET CONNECTION REQUIRED'
                ) : cooldownRemaining > 0 ? (
                  `> COOLDOWN: ${cooldownRemaining}s`
                ) : (
                  '> SYSTEM READY'
                )}
              </p>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scanline {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }

        * {
          image-rendering: pixelated;
          image-rendering: crisp-edges;
        }

        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          color: #ffffff;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-family: 'Bitcount Grid Single', 'Courier New', monospace;
        }

        .markdown-content code {
          background: rgba(112, 64, 190, 0.2);
          color: #B080E0;
          padding: 0.2rem 0.4rem;
          border: 2px solid var(--primary-purple);
        }

        .markdown-content a {
          color: #B080E0;
          text-decoration: underline;
        }

        .markdown-content p {
          color: #f3f4f6;
        }

        .markdown-content strong {
          color: #ffffff;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
