import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PlusCircle, Tag, MapPin, Type, AlignLeft, Image as ImageIcon } from 'lucide-react';

export default async function AnunciarPage() {
  const user = await requireAuth();
  if (!user) return redirect('/login');

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  async function handleCreate(formData: FormData) {
    'use server';
    const user = await requireAuth();
    if (!user) return redirect('/login');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const condition = formData.get('condition') as string;
    const categoryId = parseInt(formData.get('categoryId') as string, 10);
    const address = formData.get('address') as string;
    const imageUrl = formData.get('imageUrl') as string;
    
    const priceRaw = formData.get('price') as string;
    const price = priceRaw ? parseFloat(priceRaw) : null;

    if (!title || !description || !condition || !categoryId) return;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        condition,
        categoryId,
        address: address || null,
        price,
        images: imageUrl ? [imageUrl] : [],
        userId: user.id
      }
    });

    redirect(`/produto/${listing.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <PlusCircle size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">Criar Anúncio</h1>
          <p className="text-muted-foreground font-medium">Preencha os detalhes para desapegar do seu item.</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-3xl border border-border/50 shadow-sm">
        <form action={handleCreate} className="space-y-6">
          
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-foreground ml-1">Título do Produto <span className="text-primary">*</span></label>
            <div className="relative">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input name="title" required className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium" placeholder="Ex: Bicicleta Caloi 10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-foreground ml-1">Categoria <span className="text-primary">*</span></label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <select name="categoryId" required className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium appearance-none">
                  <option value="">Selecione...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-foreground ml-1">Condição <span className="text-primary">*</span></label>
              <select name="condition" required className="w-full px-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium appearance-none">
                <option value="Novo">Novo</option>
                <option value="Seminovo">Seminovo</option>
                <option value="Usado - Excelente">Usado - Excelente</option>
                <option value="Usado - Bom">Usado - Bom</option>
                <option value="Usado - Com marcas de uso">Usado - Com marcas de uso</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-foreground ml-1">Preço (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                <input name="price" type="number" step="0.01" min="0" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium" placeholder="Deixe vazio para doação" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-foreground ml-1">Localização</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input name="address" className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium" placeholder="Bairro, Cidade" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-foreground ml-1">URL da Imagem Principal</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input name="imageUrl" type="url" className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium" placeholder="https://exemplo.com/imagem.jpg" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-foreground ml-1">Descrição <span className="text-primary">*</span></label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-5 text-muted-foreground" size={20} />
              <textarea name="description" required rows={5} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium" placeholder="Detalhe o estado do item, tempo de uso, especificações..." />
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold text-lg py-4 px-4 rounded-2xl shadow-[0_4px_15px_rgba(255,105,46,0.25)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
              <PlusCircle size={22} />
              Publicar Anúncio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
