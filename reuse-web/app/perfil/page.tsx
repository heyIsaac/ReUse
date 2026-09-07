import { requireAuth, SESSION_COOKIE } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ProductCard } from '@/components/ProductCard';
import { LogOut, PackageSearch, PlusCircle } from 'lucide-react';

export default async function PerfilPage() {
  const user = await requireAuth();
  if (!user) return redirect('/login');

  const listings = await prisma.listing.findMany({
    where: { userId: user.id },
    include: { category: true, user: true },
    orderBy: { createdAt: 'desc' }
  });

  async function handleLogout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    redirect('/login');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header do Perfil */}
      <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Fundo decorativo sutil */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 z-10 text-center md:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={user.avatarUrl || 'https://ui-avatars.com/api/?name=User'} 
            alt={user.name || 'User'} 
            className="w-28 h-28 rounded-full border-4 border-white shadow-md object-cover"
          />
          <div>
            <h1 className="text-3xl font-black text-foreground mb-1">{user.name}</h1>
            <p className="text-muted-foreground font-medium mb-3">{user.email}</p>
            <div className="inline-block px-3 py-1 bg-background rounded-full text-xs font-bold text-muted-foreground border border-border">
              Membro desde {user.createdAt.toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
        
        <form action={handleLogout} className="z-10 w-full md:w-auto">
          <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-full font-bold transition-colors">
            <LogOut size={18} />
            Sair da Conta
          </button>
        </form>
      </div>

      {/* Meus Anúncios */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-foreground">Meus Anúncios</h2>
          <Link href="/anunciar" className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-full font-bold shadow-sm transition-transform hover:scale-105 active:scale-95">
            <PlusCircle size={20} />
            Novo Anúncio
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-center border border-border/50 h-[40vh]">
            <PackageSearch size={64} className="text-border mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Você ainda não anunciou nada</h3>
            <p className="text-muted-foreground max-w-md">Que tal dar uma nova vida àquele objeto que você não usa mais?</p>
            <Link href="/anunciar" className="mt-6 px-8 py-3 bg-primary text-white rounded-full font-bold shadow-sm hover:scale-105 transition-transform">
              Anunciar agora
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ProductCard key={listing.id} item={listing as any} isOwner={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
