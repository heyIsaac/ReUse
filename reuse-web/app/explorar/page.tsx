import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { PackageSearch, Filter, Search } from 'lucide-react';
import Link from 'next/link';

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams?: Promise<{ categoria?: string }>;
}) {
  const resolvedParams = await searchParams;
  const categoriaId = resolvedParams?.categoria ? parseInt(resolvedParams.categoria, 10) : undefined;

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  const listings = await prisma.listing.findMany({
    where: categoriaId ? { categoryId: categoriaId } : undefined,
    include: {
      category: true,
      user: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar - Filtros */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-border/50 shadow-sm sticky top-28">
          <div className="flex items-center gap-2 mb-6 text-foreground font-black text-lg">
            <Filter size={20} />
            Filtros
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Categorias</h3>
              <div className="flex flex-col gap-2">
                <Link 
                  href="/explorar" 
                  className={`text-sm font-medium transition-colors p-2 rounded-lg ${!categoriaId ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                >
                  Todas as categorias
                </Link>
                {categories.map(cat => (
                  <Link 
                    key={cat.id}
                    href={`/explorar?categoria=${cat.id}`} 
                    className={`text-sm font-medium transition-colors p-2 rounded-lg ${categoriaId === cat.id ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Outros filtros visuais para demonstrar a UI */}
            <div className="pt-4 border-t border-border/50">
              <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Condição</h3>
              <div className="space-y-2">
                {['Novo', 'Seminovo', 'Com marcas de uso'].map(cond => (
                  <label key={cond} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer group">
                    <input type="checkbox" className="rounded text-primary border-border focus:ring-primary/20 bg-background" />
                    <span className="group-hover:text-foreground transition-colors">{cond}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Área Principal - Produtos */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border/50 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-foreground">
              Explorar Produtos
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {listings.length} {listings.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-center border border-border/50 h-[50vh]">
            <PackageSearch size={64} className="text-border mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground max-w-md">Não encontramos produtos para esta categoria. Tente limpar os filtros ou selecionar outra categoria.</p>
            <Link href="/explorar" className="mt-6 px-6 py-3 bg-card border border-border text-foreground rounded-full font-bold hover:bg-muted transition-colors">
              Limpar Filtros
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ProductCard key={listing.id} item={listing as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
