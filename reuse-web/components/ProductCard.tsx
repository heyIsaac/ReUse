import Link from 'next/link';
import { Heart, MapPin, User, Package } from 'lucide-react';

interface ListingProps {
  id: number;
  title: string;
  price: number | null;
  images: string[];
  condition: string;
  address: string | null;
  category: { name: string };
  user?: { name: string | null };
}

interface ProductCardProps {
  item: ListingProps;
  isOwner?: boolean;
  isFavorite?: boolean;
}

export function ProductCard({ item, isOwner = false, isFavorite = false }: ProductCardProps) {
  const thumbnailUrl = item.images.length > 0 ? item.images[0] : null;

  // Corrigindo as cores das badges com base na nova paleta CSS
  let conditionBadgeColor = 'bg-muted-foreground text-white'; // fallback
  if (item.condition === 'Novo') conditionBadgeColor = 'bg-[var(--color-badge-new)] text-[var(--color-foreground)]';
  if (item.condition === 'Usado - Excelente' || item.condition === 'Seminovo') conditionBadgeColor = 'bg-[var(--color-badge-used)] text-[var(--color-foreground)]';
  if (item.condition === 'Usado - Bom' || item.condition === 'Usado - Com marcas de uso') conditionBadgeColor = 'bg-[var(--color-badge-marks)] text-white';

  return (
    <Link 
      href={`/produto/${item.id}`} 
      className="group flex flex-col bg-card rounded-2xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 w-full bg-[var(--color-border)] overflow-hidden">
        {thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={thumbnailUrl} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <Package size={48} className="opacity-20 mb-2" />
            <span className="text-xs font-medium">Sem imagem</span>
          </div>
        )}

        {/* Favorite / Owner Badge */}
        {isOwner ? (
          <div className="absolute top-2 right-2 bg-foreground/90 backdrop-blur px-2.5 py-1.5 rounded-full flex items-center gap-1">
            <User color="#fff" size={12} />
            <span className="text-white text-[10px] font-bold">Seu</span>
          </div>
        ) : (
          <div className={`absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-full transition-transform hover:scale-110 ${isFavorite ? 'shadow-sm' : ''}`}>
            <Heart
              color="var(--color-primary)"
              size={18}
              strokeWidth={isFavorite ? 3 : 2.5}
              fill={isFavorite ? 'var(--color-primary)' : 'transparent'}
            />
          </div>
        )}

        {/* Condition Badge */}
        <div className={`absolute bottom-2 left-2 px-2.5 py-1.5 rounded-lg shadow-sm ${conditionBadgeColor}`}>
          <span className="text-[10px] font-black uppercase tracking-wide">
            {item.condition}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-foreground text-sm font-bold mb-1 line-clamp-1 group-hover:text-primary transition-colors" title={item.title}>
          {item.title}
        </h3>
        
        <div className="font-black text-lg text-foreground mb-3 mt-1">
          {item.price != null ? `R$ ${item.price.toFixed(2)}` : 'Troca / Doação'}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center gap-1 max-w-[60%]">
            <MapPin className="text-muted-foreground flex-shrink-0" size={12} />
            <span className="text-muted-foreground text-[11px] font-medium truncate" title={item.address || ''}>
              {isOwner ? 'Você' : (item.user?.name || item.address || 'Anônimo')}
            </span>
          </div>
          <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider truncate max-w-[35%] text-right">
            {item.category.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
