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
- `components/`: Componentes React compartilhados (incluindo o `ChatAssistant`).
- `lib/`: Classes auxiliares (Singleton do Prisma, Funções de Auth e Cookies).
- `prisma/`: Definições de Modelos (schema.prisma) e script de Seed.
- `public/`: Assets estáticos.
- `DOCUMENTACAO.md`: Documentação acadêmica detalhando a arquitetura Next.js, uso do Prisma e do banco.

## ReUse Assistente - Integração IBM Watson

A plataforma ReUse conta com um Assistente Virtual integrado via IBM watsonx Assistant (Projeto Acadêmico 02 - ReUse com voz). O assistente pode interagir por texto ou voz (utilizando a Web Speech API do navegador) e realizar operações no backend como consultar produtos, listar favoritos e ajudar os usuários.

### Funcionalidades do Assistente
- **Interface Conversacional**: Widget flutuante integrado ao sistema, mantendo o padrão visual e com resposta de voz.
- **Consultar Anúncios**: Exibe os anúncios do usuário autenticado.
- **Favoritos**: Exibe a lista de favoritos.
- **Central de Ajuda**: Orientações de uso da plataforma (como favoritar, cadastrar produtos).
- **Voz**: Suporte para reconhecimento e sintetização de voz através de API nativa (`SpeechRecognition` e `SpeechSynthesis`).

### Como Configurar o IBM Watson

Para habilitar o cérebro real do Watson (substituindo o mock local), você precisa:
1. Acesse o **IBM Cloud** e crie/acesse o serviço do **watsonx Assistant**.
2. Crie um Assistente e navegue até as **Configurações do Assistente (Assistant Settings)** > **Detalhes da API (API Details)**.
3. Obtenha a **Chave de API (API Key)**, a **URL do Serviço** e o **ID de Ambiente (Environment ID)**.
4. Preencha no seu arquivo `.env`:

```env
WATSON_ASSISTANT_APIKEY="sua_chave_aqui"
WATSON_ASSISTANT_URL="https://api.us-south.assistant.watson.cloud.ibm.com/..."
WATSON_ASSISTANT_ENVIRONMENT_ID="seu_environment_id_aqui"
```

A integração está preparada em `app/api/chat/route.ts`. Quando os tokens não estão preenchidos, a plataforma utiliza um motor simples de roteamento simulando as intenções do assistente para não bloquear o seu uso.

### Execução e Testes do Assistente

1. Suba a aplicação normalmente (`pnpm dev`).
2. Acesse `localhost:3000`. O botão de Chat estará no canto inferior direito.
3. Permita o uso do microfone no navegador para interagir por voz.
4. Para testar ações bloqueadas, acesse primeiro `/login` com um usuário criado no banco.

**Segurança**: O frontend nunca recebe as chaves da IBM. Tudo passa pela rota `/api/chat` (Proxy Server) que também executa operações no banco (Prisma) usando a sessão atual.

*(Limitações: Em navegadores sem suporte à Web Speech API completa como Firefox não-configurado, a conversão Texto/Fala pode não funcionar perfeitamente. Nesses casos, o fallback de texto funcionará.)*
