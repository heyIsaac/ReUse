# 🌱 ReUse

[![Tests](https://github.com/heyIsaac/ReUse/actions/workflows/tests.yml/badge.svg)](https://github.com/heyIsaac/ReUse/actions/workflows/tests.yml)
[![CI](https://github.com/heyIsaac/ReUse/actions/workflows/ci.yml/badge.svg)](https://github.com/heyIsaac/ReUse/actions/workflows/ci.yml)
[![Lint](https://github.com/heyIsaac/ReUse/actions/workflows/lint.yml/badge.svg)](https://github.com/heyIsaac/ReUse/actions/workflows/lint.yml)
[![TypeScript](https://github.com/heyIsaac/ReUse/actions/workflows/type-check.yml/badge.svg)](https://github.com/heyIsaac/ReUse/actions/workflows/type-check.yml)

[Figma](https://www.figma.com/design/ALdrMz6X0cFopZPIkJwmIJ/ReUse?node-id=2-8&t=7SdET4y0iHcbCRvk-1) | [API em Produção](https://reuse-hx4x.onrender.com/api/listings)

O ReUse é uma plataforma focada em **sustentabilidade e economia circular**, conectando usuários para dar um novo ciclo de vida a produtos. O app permite publicar desapegos, encontrar itens por categoria ou localização, negociar via chat em tempo real e confirmar entregas com QR Code.

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Mobile** | Expo 54, React Native 0.81, TypeScript |
| **Estilização** | NativeWind 4 + Tailwind 3 |
| **Estado/Dados** | TanStack Query, React Hook Form, Zod |
| **Auth** | Supabase Auth (OTP por email, Google, Facebook) |
| **Banco de Dados** | Supabase PostgreSQL |
| **Storage** | Supabase Storage (imagens de anúncios e avatares) |
| **Armazenamento Local** | expo-secure-store (onboarding, preferências, rascunhos) |
| **Backend** | .NET 8, Entity Framework Core 8, SignalR |
| **Deploy** | Render (API em Docker), Supabase (DB + Auth + Storage) |
| **Câmera** | expo-camera (QR scanner), expo-image-picker (fotos) |
| **GPS/Mapa** | expo-location, react-native-maps |
| **QR Code** | react-native-qrcode-svg (geração), expo-camera (leitura) |
| **Email** | Resend (SMTP customizado via Supabase) |
| **Testes** | Jest, React Native Testing Library (16 testes configurados) |
| **CI/CD** | GitHub Actions (100% gratuito) |

## Funcionalidades

### Autenticação
- Login por email com OTP de 6 dígitos (Supabase Auth + Resend SMTP)
- Login social com Google e Facebook (SDK nativo + Supabase)
- Cadastro de primeiro acesso com nome, data de nascimento, gênero e avatar
- Splash screen animada durante verificação de sessão

### Anúncios (Desapegos)
- Criação em fluxo wizard (fotos + metadados) com câmera nativa ou galeria
- Upload direto ao Supabase Storage (sem passar pelo backend)
- Captura automática de GPS + geocoding reverso na criação
- Edição e exclusão de anúncios próprios
- Busca por texto (título, descrição, categoria) em tempo real
- Filtro por categoria (dados dinâmicos da API)
- Pull-to-refresh no feed
- Rascunho automático salvo com SecureStore

### Mapa
- Visualização de anúncios em mapa com react-native-maps
- Markers personalizados com thumbnail e callout
- Centralização na localização do usuário (GPS)

### Chat
- Duas abas: "Meus Anúncios" (interessados nos seus itens) e "Meus Interesses" (itens que você quer)
- Mensagens em tempo real via SignalR (WebSocket)
- Header contextual com avatar, nome e título do anúncio
- Proteção contra chat consigo mesmo

### QR Code para Entrega
- Dono gera QR Code único na sala de chat (modal visual)
- Interessado escaneia com câmera nativa para confirmar recebimento
- Token único e de uso único (segurança)
- Ícone de scanner acessível direto na home

### Avaliações
- 1 a 5 estrelas + comentário após conclusão de doação
- Média exibida no perfil do usuário
- Uma avaliação por negociação

### Notificações Internas
- Tipos: boas-vindas, novo interessado, doação concluída, favorito doado, nova avaliação
- Badge de não lidas no sino da home (atualiza a cada 30s)
- Navegação contextual ao clicar (abre a tela relacionada)

### Favoritos
- Coração funcional nos cards de anúncio
- Tela "Itens Salvos" no perfil
- Notificação quando item favoritado é doado

### Perfil e Configurações
- Stats reais: desapegos publicados, impacto ambiental (kg CO₂), avaliação média
- Editar perfil: nome, nascimento, gênero, avatar (câmera/galeria ou Dicebear)
- Configurações: toggles de notificação, permissões nativas, deletar conta
- "Meus Anúncios" com lista filtrada

### Armazenamento Local (SecureStore)
- Flag de onboarding (não exibir novamente)
- Última categoria selecionada (persistência entre sessões)
- Rascunho de anúncio (auto-save com debounce, restaura ao reabrir)
- Preferências de notificação (toggles on/off)

## Estrutura do Projeto

```
ReUse/
├── frontend/                     # App Mobile (Expo / React Native)
│   ├── app/                      # Rotas (Expo Router file-based)
│   │   ├── (auth)/               # Login, OTP, Cadastro
│   │   ├── (tabs)/               # Home, Mapa, Chat, Perfil
│   │   ├── chat/                 # Sala de chat, lista de interessados
│   │   ├── listing/              # Detalhe do anúncio
│   │   ├── create-listing.tsx    # Wizard de criação
│   │   ├── edit-listing.tsx      # Edição de anúncio
│   │   ├── edit-profile.tsx      # Edição de perfil
│   │   ├── favorites.tsx         # Itens salvos
│   │   ├── my-listings.tsx       # Meus anúncios
│   │   ├── notifications.tsx     # Notificações internas
│   │   ├── qr-scanner.tsx        # Scanner de QR Code
│   │   ├── rate.tsx              # Avaliação pós-entrega
│   │   └── settings.tsx          # Configurações
│   ├── components/               # Componentes reutilizáveis (UI, home, layout)
│   ├── src/
│   │   ├── config/env.ts         # Variáveis de ambiente centralizadas
│   │   ├── hooks/                # useUserProfile, useFavorites, useEmailAuth, etc.
│   │   └── services/             # api.ts, supabase.ts, supabaseStorage.ts, useListings.ts
│   ├── .env                      # Variáveis de produção
│   └── .env.example              # Template para novos devs
│
├── api/                          # Backend (.NET 8 Web API)
│   └── ReUse.Api/
│       ├── Controllers/          # Listings, Chat, Users, Favorites, Ratings, Notifications, Categories
│       ├── Models/               # User, Listing, ChatRoom, ChatMessage, Favorite, Rating, Notification, Category
│       ├── Data/AppDbContext.cs   # EF Core mapeando tabelas Supabase (snake_case)
│       ├── Hubs/ChatHub.cs       # SignalR para chat em tempo real
│       ├── Dockerfile            # Deploy em container no Render
│       └── Program.cs            # Configuração, CORS, JWT (JWKS do Supabase)
│
├── .github/
│   └── workflows/                # GitHub Actions (CI/CD gratuito)
│       ├── tests.yml             # Testes automatizados
│       ├── lint.yml              # Verificação de código
│       ├── type-check.yml        # TypeScript check
│       └── ci.yml                # Pipeline completo
│
├── CHANGELOG.md                  # Histórico detalhado de mudanças
└── README.md
```

## Como Rodar

### Frontend

```bash
cd frontend
cp .env.example .env
# Editar .env com suas chaves do Supabase
yarn install
npx expo run:ios    # iOS (requer Xcode + CocoaPods)
npx expo run:android # Android (requer Android Studio)
```

### Backend

```bash
cd api/ReUse.Api
dotnet run
```

### Testes

```bash
cd frontend

# Rodar todos os testes
yarn test

# Modo watch (re-executa ao salvar)
yarn test:watch

# Com cobertura de código
yarn test:coverage
```

📚 **Documentação completa:** [`frontend/TESTING.md`](frontend/TESTING.md)

### Variáveis de Ambiente (Frontend)

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | URL da API (Render ou local) |
| `EXPO_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Chave pública do Supabase |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Client ID do Google (OAuth) |

### Variáveis de Ambiente (Render)

| Variável | Descrição |
|----------|-----------|
| `ConnectionStrings__DefaultConnection` | Connection string do Supabase (pooler) |
| `Supabase__Url` | URL do projeto Supabase |

## Banco de Dados (Supabase)

Tabelas gerenciadas via SQL Editor:

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários (vinculado ao auth.users) |
| `listings` | Anúncios/desapegos com imagens e localização |
| `categories` | Categorias dinâmicas |
| `chat_rooms` | Salas de chat com status e QR token |
| `chat_messages` | Mensagens do chat |
| `favorites` | Itens salvos pelos usuários |
| `ratings` | Avaliações pós-entrega |
| `notifications` | Notificações internas |

## Testes e CI/CD

### 🧪 Testes Automatizados

O projeto possui **16 testes configurados** com Jest e React Native Testing Library:

- ✅ Testes unitários (hooks, serviços)
- ✅ Testes de componentes (interação do usuário)
- ✅ Cobertura de código configurada
- ✅ 13 testes passando atualmente

**Status dos testes:** 
- 🟢 `useEmailAuth` - Hook de autenticação (4 testes)
- 🟢 `api.test` - Interceptors e tokens (5 testes)
- 🟢 `supabaseStorage` - Upload de imagens (6 testes)
- 🟢 `Button` - Componente UI (7 testes)

### 🚀 GitHub Actions (CI/CD Gratuito)

**4 workflows configurados** que rodam automaticamente a cada push:

| Workflow | O que faz | Duração |
|----------|-----------|---------|
| 🧪 **Tests** | Roda todos os testes com cobertura | ~3 min |
| 🔍 **Lint** | Verifica qualidade de código (ESLint) | ~1 min |
| 📝 **TypeScript** | Valida tipos TypeScript | ~1 min |
| ✨ **CI** | Pipeline completo (Node 18 e 20) | ~5 min |

**100% Gratuito:**
- ♾️ Ilimitado para repositórios públicos
- 2.000 minutos/mês para repositórios privados

📚 **Setup completo:** [`.github/SETUP.md`](.github/SETUP.md)

## 📚 Documentação Adicional

- [`CHANGELOG.md`](CHANGELOG.md) - Histórico detalhado de mudanças
- [`frontend/TESTING.md`](frontend/TESTING.md) - Guia completo de testes (3500+ linhas)
- [`frontend/QUICK_START_TESTES.md`](frontend/QUICK_START_TESTES.md) - Início rápido com testes
- [`.github/GITHUB_ACTIONS.md`](.github/GITHUB_ACTIONS.md) - GitHub Actions explicado
- [`.github/SETUP.md`](.github/SETUP.md) - Setup rápido do CI/CD

> Documentação atualizada em: Maio de 2026.
