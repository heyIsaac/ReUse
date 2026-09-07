import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { PackageSearch, Leaf, Zap, Users } from 'lucide-react';

export default async function Home() {
  const listings = await prisma.listing.findMany({
    include: {
      category: true,
      user: true,
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 4 // Highlights
  });

  const categories = await prisma.category.findMany();

  return (
    <div className="flex flex-col gap-16 pb-12">
      {/* Hero Section */}
      <section className="bg-card rounded-3xl p-8 sm:p-12 md:p-16 flex flex-col items-center text-center mt-4 border border-border/50 shadow-sm relative overflow-hidden">
        {/* Decorativo de fundo bem sutil (opcional) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-new/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
            Dê uma nova vida aos <br />
            seus objetos com o <span className="text-primary relative inline-block">
              ReUse!
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/>
              </svg>
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            A plataforma ideal para comprar, vender e trocar produtos usados. Sustentabilidade e economia em um só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/explorar" 
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold text-lg rounded-full shadow-[0_8px_20px_rgba(255,105,46,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              Explorar Produtos
            </Link>
            <Link 
              href="/anunciar" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-foreground font-bold text-lg rounded-full shadow-sm hover:shadow-md border border-border hover:border-primary/50 transition-all"
            >
              Quero Anunciar
            </Link>
          </div>
        </div>
      </section>

      {/* Categorias (Chips) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground">O que você procura?</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/explorar" className="px-5 py-2.5 bg-foreground text-white rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-sm">
            Todos
          </Link>
          {categories.map(cat => (
            <Link 
              key={cat.id}
              href={`/explorar?categoria=${cat.id}`} 
              className="px-5 py-2.5 bg-white border border-border text-foreground rounded-full font-bold text-sm hover:border-primary hover:text-primary hover:shadow-sm transition-all"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Destaques (Produtos Recentes) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground">Adicionados Recentemente</h2>
          <Link href="/explorar" className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
            Ver todos
          </Link>
        </div>
        
        {listings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-border/50">
            <PackageSearch size={64} className="text-border mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum produto ainda</h3>
            <p className="text-muted-foreground max-w-md">Seja o primeiro a dar uma nova vida a um objeto! Crie um anúncio agora mesmo.</p>
            <Link href="/anunciar" className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-bold hover:scale-105 transition-transform">
              Anunciar um item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map(listing => (
              <ProductCard key={listing.id} item={listing as any} />
            ))}
          </div>
        )}
      </section>

      {/* Diferenciais / Benefícios */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="bg-white p-8 rounded-3xl border border-border/50 shadow-sm flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 bg-[var(--color-badge-new)]/20 text-[var(--color-badge-new)] flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform">
            <Leaf size={32} />
          </div>
          <h3 className="text-xl font-black text-foreground mb-3">Sustentável</h3>
          <p className="text-muted-foreground font-medium">Prolongue a vida útil dos produtos e ajude a reduzir drasticamente o impacto ambiental.</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-border/50 shadow-sm flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 bg-[var(--color-badge-used)]/20 text-[var(--color-badge-used)] flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform">
            <Zap size={32} />
          </div>
          <h3 className="text-xl font-black text-foreground mb-3">Econômico</h3>
          <p className="text-muted-foreground font-medium">Encontre produtos de altíssima qualidade por preços muito mais acessíveis que nas lojas.</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-border/50 shadow-sm flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-16 h-16 bg-primary/20 text-primary flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-black text-foreground mb-3">Comunidade</h3>
          <p className="text-muted-foreground font-medium">Conecte-se com pessoas incríveis próximas a você para trocas e vendas locais seguras.</p>
        </div>
      </section>
    </div>
  );
}
