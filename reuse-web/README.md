# ReUse! - Web App

Este projeto é a versão Web da plataforma **ReUse!**, construída com Next.js, focada em promover a economia circular através de compra, venda e troca de produtos usados.

## Tecnologias
- **Framework**: Next.js 16 (App Router)
- **Estilização**: Tailwind CSS v4
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Linguagem**: TypeScript

## Requisitos
- Node.js (v18 ou superior)
- Banco de dados PostgreSQL rodando (localmente ou via nuvem/docker)
- Gerenciador de pacotes (`pnpm`, `npm` ou `yarn`)

## Instalação e Configuração

1. **Instalar Dependências**
   ```bash
   cd reuse-web
   pnpm install
   ```

2. **Configuração do `.env`**
   - Na raiz do projeto `reuse-web`, renomeie o arquivo `.env.example` para `.env`.
   - Edite o arquivo `.env` para apontar para a sua instância do PostgreSQL:
     ```env
     DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public"
     ```

3. **Prisma e Migrations**
   - Com o banco configurado, crie as tabelas executando o comando (Db Push é suficiente para ambientes de dev sem histórico, caso prefira, utilize `prisma migrate dev`):
     ```bash
     npx prisma db push
     ```

4. **Popular o Banco de Dados (Seed)**
   - Este comando irá criar categorias padrões ("Eletrônicos", "Móveis", etc) e um anúncio de exemplo:
     ```bash
     pnpm run prisma db seed
     ```
     *(Você precisa certificar-se de ter configurado o `ts-node` ou `tsx` no seu package.json de acordo com o setup do projeto).*

5. **Executar a Aplicação**
   ```bash
   pnpm dev
   ```
   Acesse a aplicação em [http://localhost:3000](http://localhost:3000) e divirta-se!

## Estrutura do Projeto
- `app/`: Contém as rotas da aplicação (Home, Login, Explorar, Perfil, Produto).
- `lib/`: Classes auxiliares (Singleton do Prisma, Funções de Auth e Cookies).
- `prisma/`: Definições de Modelos (schema.prisma) e script de Seed.
- `public/`: Assets estáticos.
- `DOCUMENTACAO.md`: Documentação acadêmica detalhando a arquitetura Next.js, uso do Prisma e do banco.
