import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Categories
  const categories = ['Eletrônicos', 'Roupas', 'Móveis', 'Livros', 'Outros'];
  
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Create a Demo User
  const user = await prisma.user.upsert({
    where: { email: 'demo@reuse.com' },
    update: {},
    create: {
      name: 'Usuário Demo',
      email: 'demo@reuse.com',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
    },
  });

  // Create a Demo Listing
  const category = await prisma.category.findUnique({ where: { name: 'Eletrônicos' } });
  
  if (category) {
    const existingListing = await prisma.listing.findFirst({
      where: { title: 'Smartphone Usado em Ótimo Estado' }
    });

    if (!existingListing) {
      await prisma.listing.create({
        data: {
          title: 'Smartphone Usado em Ótimo Estado',
          description: 'Aparelho bem conservado, com película e capinha. Acompanha carregador original.',
          condition: 'Usado',
          price: 1200.00,
          images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'],
          userId: user.id,
          categoryId: category.id,
          address: 'São Paulo, SP'
        }
      });
    }
  }

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
