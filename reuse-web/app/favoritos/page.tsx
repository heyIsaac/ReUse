import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { HeartCrack, Heart } from 'lucide-react';

export default async function FavoritosPage() {
  const user = await requireAuth();
  if (!user) return redirect('/login');

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        include: {
          category: true,
          user: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Heart size={28} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">Meus Favoritos</h1>
          <p className="text-muted-foreground font-medium">Itens que você salvou para ver depois.</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-center border border-border/50 h-[50vh]">
          <HeartCrack size={64} className="text-border mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Nenhum favorito ainda</h3>
          <p className="text-muted-foreground max-w-md">Você não salvou nenhum item. Navegue pela plataforma e salve os itens que você mais gostar!</p>
          <Link href="/explorar" className="mt-6 px-8 py-3 bg-primary text-white rounded-full font-bold shadow-sm hover:scale-105 transition-transform">
            Explorar Produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map(({ listing }) => (
            <ProductCard key={listing.id} item={listing as any} isFavorite={true} />
          ))}
        </div>
      )}
    </div>
  );
}
