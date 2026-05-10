# ReUse

[![Tests](https://github.com/heyIsaac/ReUse/actions/workflows/tests.yml/badge.svg)](https://github.com/heyIsaac/ReUse/actions/workflows/tests.yml)
[![CI](https://github.com/heyIsaac/ReUse/actions/workflows/ci.yml/badge.svg)](https://github.com/heyIsaac/ReUse/actions/workflows/ci.yml)

[Figma](https://www.figma.com/design/ALdrMz6X0cFopZPIkJwmIJ/ReUse?node-id=2-8&t=7SdET4y0iHcbCRvk-1) · [API em produção](https://reuse-hx4x.onrender.com/api/listings)

App de economia circular: publicar desapegos, buscar por categoria, conversar em tempo real e fechar entrega com QR Code. Trabalho acadêmico com foco em consumo de APIs, autenticação e cache local.

## Stack (resumo)

- **Mobile:** Expo 54, React Native, TypeScript, NativeWind
- **Dados no app:** TanStack Query, React Hook Form, Zod
- **Auth e arquivos:** Supabase (login por e-mail com código, Google, Facebook; fotos no Storage)
- **Backend:** .NET 8, EF Core, Postgres (Supabase), SignalR para chat
- **Deploy da API:** Render (Docker)

## O que o app consome

- **API própria (Render):** anúncios, favoritos, categorias, chat, avaliações, notificações.
- **Supabase:** quem está logado e upload de imagens.
- **APIs públicas sem chave:** ViaCEP no fluxo de criar anúncio (CEP opcional); câmbio (perfil); estimativa de CO₂ no perfil é cálculo local com fatores por categoria (não é serviço pago).

Autenticação: JWT do Supabase nas chamadas à API. Cache: TanStack Query com tempos maiores no feed e perfil; chat e notificações continuam mais “frescos” de propósito.

## Rodar o frontend

```bash
cd frontend
cp .env.example .env
# Preencher EXPO_PUBLIC_API_URL, Supabase e Google conforme o exemplo
yarn install
```

O projeto usa módulos nativos (Facebook, mapas, Google Sign-In). **Expo Go costuma quebrar**; use build de desenvolvimento:

```bash
yarn ios
# ou
yarn android
```

Para testar com as mesmas variáveis que você usa em produção no build local:

```bash
cp .env.example .env.production
# preencher .env.production (arquivo não vai para o git)
yarn ios:prod
```

## Rodar a API

```bash
cd api/ReUse.Api
dotnet run
```

Variáveis da API no Render: connection string do Postgres e URL do Supabase (JWKS para validar o token).

## Testes (frontend)

```bash
cd frontend
yarn test
```

## Estrutura rápida

- `frontend/` — app Expo (pastas `app/`, `components/`, `src/`)
- `api/ReUse.Api/` — Web API .NET
- `.github/workflows/` — CI (testes, lint, TypeScript)

Detalhes de histórico e decisões técnicas mais longas estão no `CHANGELOG.md`.
