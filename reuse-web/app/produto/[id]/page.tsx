import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Heart, MapPin, Package, ShieldCheck, ChevronRight, Share2, MessageCircle } from 'lucide-react';
import { ContactSellerButton } from '@/components/ContactSellerButton';

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  
  if (isNaN(id)) return notFound();

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      category: true,
      user: true,
    }
  });

  if (!listing) return notFound();

  const currentUser = await getSessionUser();
  
  let isFavorite = false;
  if (currentUser) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: currentUser.id,
          listingId: listing.id
        }
      }
    });
    isFavorite = !!favorite;
  }

  async function toggleFavorite() {
    'use server';
    if (!currentUser) return;

    if (isFavorite) {
      await prisma.favorite.delete({
        where: {
          userId_listingId: {
            userId: currentUser.id,
            listingId: listing!.id
          }
        }
      });
    } else {
      await prisma.favorite.create({
        data: {
          userId: currentUser.id,
          listingId: listing!.id
        }
      });
    }
    revalidatePath(`/produto/${listing!.id}`);
  }

  // Corrigindo as cores das badges com base na nova paleta CSS
  let conditionBadgeColor = 'bg-muted-foreground text-white'; // fallback
  if (listing.condition === 'Novo') conditionBadgeColor = 'bg-[var(--color-badge-new)] text-[var(--color-foreground)]';
  if (listing.condition === 'Usado - Excelente' || listing.condition === 'Seminovo') conditionBadgeColor = 'bg-[var(--color-badge-used)] text-[var(--color-foreground)]';
  if (listing.condition === 'Usado - Bom' || listing.condition === 'Usado - Com marcas de uso') conditionBadgeColor = 'bg-[var(--color-badge-marks)] text-white';


  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-medium text-muted-foreground mb-4">
        <Link href="/" className="hover:text-primary transition-colors">Início</Link>
        <ChevronRight size={16} className="mx-1" />
        <Link href={`/explorar?categoria=${listing.categoryId}`} className="hover:text-primary transition-colors">{listing.category.name}</Link>
        <ChevronRight size={16} className="mx-1" />
        <span className="text-foreground truncate max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Imagem */}
        <div className="w-full md:w-1/2 lg:w-3/5 bg-[var(--color-border)] relative min-h-[300px] md:min-h-[500px]">
          {listing.images.length > 0 ? (
             /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={listing.images[0]} 
              alt={listing.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Package size={64} className="opacity-20 mb-4" />
              <span className="font-medium">Sem imagem disponível</span>
            </div>
          )}
          
          <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg shadow-sm ${conditionBadgeColor}`}>
            <span className="text-xs font-black uppercase tracking-wide">
              {listing.condition}
            </span>
          </div>
        </div>

        {/* Detalhes principais */}
        <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-8 flex flex-col">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{listing.category.name}</div>
          <h1 className="text-3xl font-black text-foreground mb-4 leading-tight">{listing.title}</h1>
          
          <div className="text-4xl font-black text-primary mb-6">
            {listing.price != null ? `R$ ${listing.price.toFixed(2)}` : 'Troca / Doação'}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <MapPin className="text-muted-foreground mt-0.5" size={20} />
              <div>
                <p className="font-bold text-foreground">Localização</p>
                <p className="text-muted-foreground">{listing.address || 'Não informado'}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3 pt-6">
            <ContactSellerButton />
            
            <div className="flex gap-3">
              {currentUser ? (
                <form action={toggleFavorite} className="flex-1">
                  <button 
                    type="submit"
                    className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl border-2 transition-all ${
                      isFavorite 
                        ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10' 
                        : 'border-border bg-transparent text-foreground hover:bg-muted'
                    }`}
                  >
                    <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                    {isFavorite ? 'Salvo' : 'Favoritar'}
                  </button>
                </form>
              ) : (
                <Link href="/login" className="flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl border-2 border-border bg-transparent text-foreground hover:bg-muted transition-all">
                  <Heart size={20} />
                  Favoritar
                </Link>
              )}
              
              <button className="flex items-center justify-center aspect-square w-[54px] rounded-2xl border-2 border-border text-foreground hover:bg-muted transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Coluna da Esquerda (Descrição) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-border/50 shadow-sm">
            <h2 className="text-xl font-black text-foreground mb-4">Descrição do Produto</h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Coluna da Direita (Anunciante & Dicas) */}
        <div className="space-y-6">
          <div className="bg-background p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={listing.user.avatarUrl || 'https://ui-avatars.com/api/?name=User'} 
              alt={listing.user.name || 'User'} 
              className="w-20 h-20 rounded-full border-4 border-white shadow-sm mb-4"
            />
            <h3 className="font-black text-xl text-foreground mb-1">{listing.user.name}</h3>
            <p className="text-muted-foreground text-sm font-medium mb-4">Membro desde {listing.user.createdAt.getFullYear()}</p>
            <Link href={`/perfil?id=${listing.userId}`} className="text-primary font-bold hover:underline">
              Ver perfil completo
            </Link>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
            <ShieldCheck className="text-blue-500 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Dica de Segurança</h4>
              <p className="text-blue-700 text-sm">Nunca faça pagamentos antecipados. Prefira encontrar o vendedor em locais públicos para realizar a troca ou compra.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
