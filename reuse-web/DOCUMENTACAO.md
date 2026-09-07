# Documentação: ReUse! Web App

Esta documentação foi elaborada para atender aos critérios da atividade acadêmica referentes ao desenvolvimento da versão Web da plataforma **ReUse!**.

## 1. Desenvolvimento Next.js (60%)

A aplicação foi construída com Next.js (App Router), focando em ser uma porta de entrada na Web para a plataforma. Ao invés de copiar todas as telas do aplicativo, priorizamos as funcionalidades mais importantes para Web.

### Telas Desenvolvidas:
- **Home (`/`)**: A Landing Page do projeto, focada em mostrar o valor (Sustentabilidade, Economia e Comunidade) e com *Call to Actions* (CTAs) para explorar produtos ou criar um anúncio.
- **Explorar (`/explorar`)**: Uma vitrine geral com todos os produtos disponíveis no banco de dados. Exibe cards limpos e responsivos.
- **Detalhes do Produto (`/produto/[id]`)**: Página focada em apresentar fotos, preço, localização e descrição do produto, incluindo ações de favoritar e contatar o vendedor.
- **Login (`/login`)**: Uma tela funcional de autenticação. Para simplificar e focar nos dados, solicita Nome e Email e gera uma sessão em *Cookies*, criando o usuário no PostgreSQL caso não exista.
- **Perfil (`/perfil`)**: Lista os anúncios que o próprio usuário autenticado publicou e exibe seus dados de conta.
- **Anunciar (`/anunciar`)**: Formulário para cadastro de um novo produto (CREATE), permitindo seleção de Categoria e upload via URL de imagem para fins de protótipo.
- **Favoritos (`/favoritos`)**: Mostra apenas os anúncios que o usuário autenticado favoritou.

### Diferenciação e Responsividade
- **Identidade Visual**: Foram mantidas as mesmas cores da versão mobile, utilizando a mesma paleta no `globals.css` (Tailwind CSS v4).
- **Responsividade**: As telas de Explorar e Favoritos utilizam CSS Grid e se adaptam perfeitamente para Desktop, Tablet e Mobile através de classes utilitárias do Tailwind (ex: `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`).

---

## 2. Prisma ORM (25%)

O **Prisma** foi utilizado para conectar a aplicação Node.js/Next.js ao PostgreSQL através de tipagem estática e queries simplificadas.

### Operações Realizadas:
- **CREATE**:
  - `app/anunciar/page.tsx`: Quando o usuário cadastra um anúncio, chamamos `prisma.listing.create()`.
  - `app/login/page.tsx`: Se o e-mail não existir, criamos o usuário com `prisma.user.create()`.
  - `app/produto/[id]/page.tsx`: Ao clicar em "Favoritar", adicionamos a relação com `prisma.favorite.create()`.
- **READ**:
  - `app/explorar/page.tsx`: Lê todos os anúncios e exibe na tela através de `prisma.listing.findMany({ include: { category: true } })`.
  - `app/produto/[id]/page.tsx`: Lê os detalhes de apenas 1 produto específico utilizando `prisma.listing.findUnique()`.
  - `app/perfil/page.tsx`: Lê os anúncios de um usuário utilizando `findMany({ where: { userId } })`.
- **UPDATE**:
  - `prisma/seed.ts`: O script de *Seed* utiliza `prisma.category.upsert()` e `upsert()` de usuário, que realiza UPDATE se já existir, e CREATE se não existir.
- **DELETE**:
  - `app/produto/[id]/page.tsx`: Quando o usuário desmarca o Favorito, removemos a relação com `prisma.favorite.delete()`.

---

## 3. Banco de Dados (15%)

Foram mapeadas as seguintes entidades no `schema.prisma` com base nas funcionalidades do ReUse!:

1. **User (Tabela `users`)**:
   - `id` (String UUID, Primary Key)
   - `name`, `email` (Unique), `avatarUrl`
   - Armazena as contas da plataforma. Relacionamento `1:N` com Produtos (Listings) e Favoritos.
2. **Category (Tabela `categories`)**:
   - `id` (Int, Primary Key)
   - `name` (Unique)
   - Categorias base do sistema (Eletrônicos, Roupas, etc).
3. **Listing / Produto (Tabela `listings`)**:
   - `id` (Int, Primary Key)
   - `title`, `description`, `price`, `images` (Array de strings), `address`.
   - `userId` (Foreign Key para User), `categoryId` (Foreign Key para Category).
   - Representa os anúncios.
4. **Favorite (Tabela `favorites`)**:
   - Tabela associativa com chaves estrangeiras `userId` e `listingId`.
   - Possui constraint `@@unique([userId, listingId])` para impedir favoritos duplicados.

---

## 4. Como Executar o Projeto

1. Tenha o **Node.js** (v18+) e o **pnpm** (ou npm/yarn) instalados.
2. Clone a pasta `reuse-web`.
3. Instale as dependências: `pnpm install`.
4. Copie `.env.example` para `.env` e ajuste a string de conexão com seu PostgreSQL (`DATABASE_URL`).
5. Gere o Prisma e aplique o schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
6. Popule o banco com dados de teste (Categorias e 1 Anúncio padrão):
   ```bash
   pnpm run prisma db seed
   ```
7. Inicie a aplicação Next.js:
   ```bash
   pnpm dev
   ```
8. Acesse `http://localhost:3000`.
