# Changelog — Branch `marco`

## Maio 2026 — integrações e ajustes recentes

- Integração com **ViaCEP** no criar anúncio (CEP opcional, último passo do fluxo).
- No **perfil**: conversão estimada de “economia” em real/dólar/euro (API pública de câmbio) e bloco de impacto em CO₂ com base nas categorias dos anúncios (cálculo local, sem API paga).
- **Cache** nas queries do TanStack: tempos de `staleTime` maiores no perfil, favoritos e feed; chat e notificações continuam sem cache agressivo.
- Scripts `yarn ios:prod` / `start:prod` com `.env.production` (via `dotenv-cli`) para build local alinhado às variáveis de produção.
- Testes novos para os hooks de CEP, câmbio e carbono.
- Após enviar **avaliação**, o perfil invalida a query da média para atualizar na hora.

## Resumo

19 commits abrangendo infraestrutura, backend, frontend e UX/UI. Migração completa para Supabase (Auth + Storage + Database), deploy em produção no Render, e implementação de funcionalidades nativas como câmera, GPS, QR Code e armazenamento seguro.

---

## 1. Infraestrutura e Deploy

- **Centralização de variáveis de ambiente**: criado `src/config/env.ts` como fonte única de verdade para todas as variáveis `EXPO_PUBLIC_*`. Nenhum outro arquivo acessa `process.env` diretamente. Criados `.env` (produção) e `.env.example` (template para devs).
- **Deploy no Render**: API .NET 8 deployada em container Docker no Render (free tier), com Dockerfile já existente. Configurado CORS para apps mobile e `UseHttpsRedirection` condicional (apenas em dev).
- **Banco de dados no Supabase**: migração completa do PostgreSQL local para Supabase (São Paulo). Tabelas gerenciadas via SQL Editor ao invés de EF Migrations. Connection pooler na porta 6543 para compatibilidade com Render.

---

## 2. Autenticação — Migração para Supabase Auth

- **OTP por email**: substituiu o fluxo antigo (backend gera código + EmailJS envia) por `supabase.auth.signInWithOtp()`. O Supabase envia o email automaticamente com o código de 6 dígitos (template customizado no dashboard).
- **Google e Facebook**: mantém SDK nativo para capturar o token, mas autenticação agora via `supabase.auth.signInWithIdToken()` ao invés de validação manual no backend.
- **JWT**: backend valida tokens do Supabase via JWKS endpoint (suporte a ECC P-256), eliminando necessidade de shared secret.
- **Eliminados**: EmailJS, AuthController, AuthService, UploadController, model OtpCode, DTOs de auth.

---

## 3. SecureStore — Armazenamento Local Seguro

O `@react-native-async-storage/async-storage` apresentou incompatibilidade com o Metro bundler do Expo 54 — o campo `"react-native": "src/index.ts"` no `package.json` do pacote fazia o Metro resolver para arquivos TypeScript não compilados, causando crash fatal em todas as versões testadas (1.23.1, 2.2.0, 3.0.2).

**Solução adotada**: `expo-secure-store`, que já estava instalado e funcionando para a sessão do Supabase. O SecureStore oferece a mesma API de key-value storage com a vantagem adicional de **criptografia nativa** (Keychain no iOS, EncryptedSharedPreferences no Android).

### Pontos de uso estratégico do SecureStore

| Chave | Funcionalidade | Descrição |
|-------|---------------|-----------|
| `hasCompletedOnboarding` | Flag de onboarding | Persiste se o usuário já viu a tela de boas-vindas. Ao reabrir, pula direto para login ou home. |
| `selectedCategory` | Categoria selecionada | Ao selecionar uma categoria no filtro da home, a escolha é persistida entre sessões. |
| `draftListing` | Rascunho de anúncio | Campos preenchidos na criação de anúncio são salvos automaticamente (debounce 1s). Ao reabrir a tela, são restaurados. Ao publicar, o rascunho é limpo. |
| `notif_messages` | Preferência de notificação | Toggle on/off de "Mensagens novas" persistido entre sessões. |
| `notif_interests` | Preferência de notificação | Toggle on/off de "Novos interessados" persistido entre sessões. |

---

## 4. Funcionalidades de Câmera Nativa

### 4a. Criação de anúncio — Câmera e Galeria

Ao adicionar foto no anúncio, o usuário escolhe entre **"Tirar foto"** (câmera nativa via `expo-image-picker`) ou **"Galeria"**. A imagem é enviada diretamente ao Supabase Storage (bucket `listings`) sem passar pelo backend. No simulador, a câmera exibe alerta amigável de indisponibilidade.

### 4b. Foto de perfil — Câmera e Galeria

Na tela de editar perfil, toque no avatar abre opções de **câmera** ou **galeria**. A foto é enviada ao Supabase Storage e usada como avatar. Alternativa disponível: grid de 12 avatares pré-definidos gerados com Dicebear.

### 4c. QR Code para confirmação de entrega

Fluxo completo utilizando câmera nativa para confirmação segura de entregas:

```
Dono gera QR → QR aparece em modal → Interessado escaneia com câmera → Entrega confirmada → Avaliação
```

- **Geração**: qualquer participante clica "Gerar QR" no chat. O backend gera um token único (`Guid`) salvo na tabela `chat_rooms`. O frontend exibe o QR Code em um **modal centralizado** usando `react-native-qrcode-svg`.
- **Escaneamento**: o outro participante clica "Escanear QR" → abre a **câmera nativa** (`expo-camera` com `CameraView` e `barcodeScannerSettings`) com overlay visual (frame quadrado, instruções). Ao detectar o QR, faz `POST /api/chat/{roomId}/confirm-delivery` com o token.
- **Segurança**: token único e de uso único. Apenas participantes da sala podem gerar ou confirmar.
- **Acesso rápido**: ícone de scanner na home (ao lado do sino) permite escanear QR sem abrir o chat.

---

## 5. Mapa com GPS

Utilizando `expo-location` para geolocalização e `react-native-maps` para visualização:

- **Criação de anúncio**: ao criar, o app captura automaticamente a localização GPS do usuário e faz geocoding reverso para exibir o nome do bairro/cidade.
- **Tab Mapa**: `MapView` com markers personalizados (thumbnail do anúncio). Callout com título, categoria, condição e link para detalhe. Botão de centralizar na localização do usuário.
- **Backend**: campos `latitude`, `longitude` e `address` no model `Listing` e na tabela `listings`.

---

## 6. Sistema de Chat — Reorganizado com 2 Abas

- **Aba "Meus Anúncios"**: lista anúncios do usuário com conversas e contagem de interessados. Ao clicar, abre lista de interessados com avatar, nome e última mensagem.
- **Aba "Meus Interesses"**: conversas onde o usuário é o interessado em itens de outros.
- **Sala de chat**: header contextual (avatar, nome, título do anúncio). Mensagens em tempo real via SignalR. Botões de QR Code para confirmação de entrega. Banner visual quando concluído.
- **Proteção**: backend impede criação de chat consigo mesmo (`ownerId == userId`).

---

## 7. Sistema de Avaliações

- Após marcar item como entregue → redireciona para tela de avaliação (1-5 estrelas + comentário opcional).
- Média de avaliações exibida no perfil (stat real, não mockado).
- Avaliação gera notificação interna para o avaliado.
- Restrição: cada pessoa só avalia uma vez por negociação.

---

## 8. Notificações Internas

Tela de notificações com lista categorizada por tipo:

| Tipo | Ícone | Cor | Trigger | Navega para |
|------|-------|-----|---------|-------------|
| Boas-vindas | Sino | Verde | Criação de conta | Criar anúncio |
| Novo interessado | Chat | Laranja | Alguém inicia chat | Tab Chat |
| Doação concluída | Presente | Teal | Item marcado como entregue | Tab Chat |
| Favorito doado | Coração | Vermelho | Item favoritado foi doado | Itens Salvos |
| Nova avaliação | Estrela | Amarelo | Alguém te avaliou | Perfil |

- Badge de não lidas no sino da home (atualiza a cada 30s).
- Botão "Marcar todas como lidas".

---

## 9. Itens Salvos (Favoritos)

- Coração funcional nos cards de anúncio — toque para favoritar/desfavoritar (preenchido quando salvo).
- Anúncios próprios não mostram coração (exibem badge "Seu").
- Tela "Itens Salvos" acessível do perfil com grid dos favoritos.
- Backend: `FavoritesController` com GET, POST, DELETE e listagem de IDs.

---

## 10. Configurações e Editar Perfil

### Configurações (`settings.tsx`)
- **Editar Perfil**: navega para tela dedicada.
- **Notificações**: toggles on/off persistidos com SecureStore.
- **Permissões**: abre configurações nativas do iOS (`Linking.openSettings()`).
- **Deletar conta**: confirmação dupla (digitar "DELETAR").

### Editar Perfil (`edit-profile.tsx`)
- Campos: nome, data de nascimento (DD/MM/AAAA com máscara), gênero (seletor visual).
- Avatar: câmera/galeria (upload ao Supabase Storage) ou grid de Dicebear.
- Salva no Supabase Auth (`user_metadata`) + tabela `profiles`.

---

## 11. Ajustes de UX/UI Focados em Mobile

- **Pull-to-refresh**: `RefreshControl` no feed atualiza anúncios e notificações.
- **Search funcional**: filtro em tempo real por título, descrição e categoria. Título dinâmico e estado vazio contextual.
- **Filtro por categoria**: carrossel horizontal edge-to-edge, categorias vindas da API com fallback.
- **Cards de anúncio**: badge "Seu" em anúncios próprios, coração funcional nos demais, tag de condição legível (fundo branco 90% opacidade, texto escuro).
- **Detalhe do anúncio**: detecta anúncio próprio → "Editar anúncio" ao invés de "Entrar em contato". Dados reais do dono.
- **Perfil**: stats reais (desapegos, impacto em kg CO₂, avaliação média). Botões navegáveis.
- **Cadastro de primeiro acesso**: nome, nascimento, gênero e avatar. Só aparece no primeiro login.
- **Alertas**: todos migrados para `Alert.alert('', 'mensagem')` sem título "Alert".
- **Padding e layout**: corrigidos botões cortados pela navbar, carrossel cortado na lateral, centralização de ícones.

---

## Stack Tecnológica Final

| Camada | Tecnologia |
|--------|-----------|
| Mobile | Expo 54, React Native 0.81, TypeScript |
| Estilização | NativeWind 4 + Tailwind 3 |
| Estado | TanStack Query, React Hook Form, Zod |
| Auth | Supabase Auth (OTP, Google, Facebook) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (imagens) |
| Armazenamento local | expo-secure-store |
| Backend | .NET 8, EF Core 8, SignalR |
| Deploy | Render (API), Supabase (DB + Auth + Storage) |
| Câmera | expo-camera, expo-image-picker |
| GPS | expo-location, react-native-maps |
| QR Code | react-native-qrcode-svg (geração), expo-camera (scanner) |
