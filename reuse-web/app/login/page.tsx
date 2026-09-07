import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth';
import { LogIn, Mail, User } from 'lucide-react';

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    'use server';
    
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    if (!email || !name) return;

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        }
      });
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    redirect('/perfil');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-border/50 shadow-sm w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <LogIn size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-black mb-2 text-center text-foreground">Entrar no ReUse!</h1>
        <p className="text-muted-foreground mb-8 text-center text-sm font-medium">
          Acesse sua conta ou cadastre-se para começar a comprar, vender e trocar.
        </p>
        
        <form action={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-bold text-foreground ml-1">Seu Nome</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input 
                type="text" 
                name="name" 
                id="name" 
                required
                placeholder="Ex: João Silva"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-bold text-foreground ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input 
                type="email" 
                name="email" 
                id="email" 
                required
                placeholder="seu@email.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 px-4 rounded-2xl shadow-[0_4px_15px_rgba(255,105,46,0.25)] transition-all hover:scale-[1.02] active:scale-95 mt-6 flex items-center justify-center gap-2"
          >
            Acessar Plataforma
          </button>
        </form>
      </div>
    </div>
  );
}
