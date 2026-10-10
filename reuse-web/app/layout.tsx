import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import { Compass, Heart, User, PlusCircle } from 'lucide-react';
import { Toaster } from 'sonner';
import ChatAssistant from '@/components/ChatAssistant';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ReUse! | Dê nova vida aos seus itens',
  description: 'Compre, venda e troque itens de forma sustentável.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)'
          }
        }} />
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 overflow-hidden rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="ReUse! Logo" width={40} height={40} className="object-cover" />
              </div>
              <span className="text-2xl font-black text-foreground tracking-tight hidden sm:block">
                ReUse!
              </span>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/explorar" className="flex items-center gap-2 text-muted-foreground hover:text-primary font-semibold transition-colors">
                <Compass size={20} />
                Explorar
              </Link>
              <Link href="/favoritos" className="flex items-center gap-2 text-muted-foreground hover:text-primary font-semibold transition-colors">
                <Heart size={20} />
                Favoritos
              </Link>
              <Link href="/perfil" className="flex items-center gap-2 text-muted-foreground hover:text-primary font-semibold transition-colors">
                <User size={20} />
                Perfil
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link 
                href="/anunciar" 
                className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold shadow-[0_4px_12px_rgba(255,105,46,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                <PlusCircle size={20} />
                <span className="hidden sm:inline">Anunciar</span>
              </Link>
            </div>
          </div>
          
          {/* Mobile Navigation Bar (Bottom) - Only visible on small screens */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex items-center justify-around h-16 px-2 pb-safe z-50">
             <Link href="/" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
                <Compass size={24} />
                <span className="text-[10px] font-bold">Início</span>
              </Link>
              <Link href="/explorar" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
                <Compass size={24} />
                <span className="text-[10px] font-bold">Explorar</span>
              </Link>
              <Link href="/favoritos" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
                <Heart size={24} />
                <span className="text-[10px] font-bold">Favoritos</span>
              </Link>
              <Link href="/perfil" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary">
                <User size={24} />
                <span className="text-[10px] font-bold">Perfil</span>
              </Link>
          </nav>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex flex-col pb-24 md:pb-8">
          {children}
        </main>
        <ChatAssistant />
      </body>
    </html>
  );
}
