'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Mic, MicOff, Loader2, Maximize2, Minimize2, Trash2, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech APIs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Synthesis
      synthRef.current = window.speechSynthesis;

      // Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'pt-BR';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setInputValue(finalTranscript);
          } else {
            setInputValue(interimTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Permissão de microfone negada.');
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    // Load welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Olá! Sou o assistente virtual do ReUse. Posso te ajudar com perguntas e realizar automações diretamente por aqui. Para testar minhas habilidades, experimente pedir coisas como:\n\n- **"Criar anúncio de teste"** (Gera um produto no banco de dados)\n- **"Excluir meu último anúncio"** (Apaga do banco de dados)\n- **"Quais produtos eu já anunciei?"** (Consulta a base)\n- **"Como favoritar um produto?"** (Guia passo a passo)\n\nO que deseja fazer hoje?',
        timestamp: new Date(),
      }
    ]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInputValue('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const speakText = (text: string) => {
    if (!isVoiceEnabled || !synthRef.current) return;
    
    // Stop any ongoing speech
    synthRef.current.cancel();

    // Strip markdown formatting for speech
    const cleanText = text.replace(/[#_*~`]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    
    // Try to find a good Portuguese voice
    const voices = synthRef.current.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR')) || voices.find(v => v.lang.includes('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Como posso ajudar agora?',
        timestamp: new Date(),
      }
    ]);
    stopSpeaking();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Stop speaking if user sends new message
    stopSpeaking();

    if (isListening) {
      recognitionRef.current?.stop();
    }

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor');
      }

      const data = await response.json();
      
      const newAssistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Desculpe, não consegui processar a resposta.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newAssistantMsg]);
      speakText(newAssistantMsg.content);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao conectar com o assistente.');
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Não foi possível conectar ao servidor. O assistente pode estar temporariamente indisponível.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-50 flex items-center justify-center group"
        aria-label="Abrir assistente virtual"
      >
        <MessageCircle size={28} className="group-hover:animate-pulse" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed z-50 flex flex-col bg-white border border-border shadow-2xl transition-all duration-300 ease-in-out ${
        isExpanded 
          ? 'bottom-0 right-0 w-full h-full sm:bottom-4 sm:right-4 sm:w-[500px] sm:h-[80vh] sm:rounded-2xl' 
          : 'bottom-4 right-4 w-[360px] h-[600px] max-h-[85vh] rounded-2xl'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <h3 className="font-bold">ReUse Assistente</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Limpar conversa"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors hidden sm:block"
            title={isExpanded ? "Restaurar tamanho" : "Expandir"}
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Fechar assistente"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-muted/30">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-sm' 
                  : msg.role === 'system'
                    ? 'bg-destructive/10 text-destructive text-xs mx-auto rounded-full'
                    : 'bg-white border border-border text-foreground shadow-sm rounded-bl-sm'
              }`}
            >
              {msg.role === 'user' || msg.role === 'system' ? (
                <p>{msg.content}</p>
              ) : (
                <div className="prose prose-sm prose-p:leading-snug prose-a:text-primary max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-border text-foreground shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Processando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-border rounded-b-2xl">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputValue);
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua mensagem ou pergunte algo..."
              className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-muted-foreground">
            As interações com o assistente estão sujeitas a falhas. Confira as informações sensíveis.
          </span>
        </div>
      </div>
    </div>
  );
}
