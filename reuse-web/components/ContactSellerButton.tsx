'use client';

import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ContactSellerButton() {
  const handleClick = () => {
    toast.info('Feature em desenvolvimento', {
      description: 'A comunicação com vendedores estará disponível em breve.',
      icon: <MessageCircle size={18} className="text-primary" />
    });
  };

  return (
    <button 
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 rounded-2xl shadow-[0_4px_15px_rgba(255,105,46,0.25)] transition-all hover:scale-[1.02] active:scale-95"
    >
      <MessageCircle size={22} />
      Falar com Vendedor
    </button>
  );
}
